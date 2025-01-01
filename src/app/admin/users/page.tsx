"use client";
import ListUser from "@/components/admin/listUser";
import { BiUser } from "react-icons/bi";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { TbUserCheck } from "react-icons/tb";
import { useEffect, useState } from "react";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import LoadingPage from "@/components/loadingPage";
import { PaginationWithLinks } from "@/components/paginationWithLinks";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface UserGrowthData {
  totalUser: number;
  totalUserPremium: number;
  totalUserFree: number;
}
function Page() {
  const { loading, setLoading } = useAppContext();
  const [listUsersData, setListUsersData] = useState([]);
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1", 10);
  const [totalPage, setTotalPage] = useState(1);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData>({
    totalUser: 0,
    totalUserPremium: 0,
    totalUserFree: 0,
  });
  const { accessToken } = useAppContext()


  useEffect(() => {
    const fetchUserAdmin = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all([
          fetchApiData("/api/admin/allUser", "GET", null, accessToken, { page: page }),
          fetchApiData("/api/admin/userGrowth", "GET", null, accessToken),
        ]);
        if (responses[0].success) {
          setListUsersData(responses[0].data.users);
          setTotalPage(responses[0].data.totalPage);
          console.log("List users:", responses[0].data.users);
        }
        if (responses[1].success) {
          setUserGrowthData(responses[1].data);
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdmin();
  }, [setLoading, page]);

  if (loading) return <LoadingPage />;

  return (
    <div className="w-full my-20 m-6 p-8 flex flex-col items-center justify-center ">
      <div className="w-full flex justify-around items-center px-4 mb-3">
        <div className="w-1/5 flex justify-center items-center gap-4 px-4 py-1 bg-secondColorBg shadow-sm shadow-primaryColorBlue rounded-md">
          <div className="w-18 h-18 bg-primaryColorBg rounded-full flex items-center justify-center">
            <BiUser className="w-10 h-10 text-primaryColorPink" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-textBig">Total Users</p>
            <p className="text-h2 text-primaryColorBlue">
              {userGrowthData.totalUser}
            </p>
          </div>
        </div>
        <div className="w-1/5 flex justify-center items-center gap-4 px-4 py-1 bg-secondColorBg shadow-sm shadow-primaryColorBlue rounded-md">
          <div className="w-18 h-18 bg-primaryColorBg rounded-full flex items-center justify-center">
            <MdOutlineWorkspacePremium className="w-10 h-10 text-primaryColorPink" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-textBig">Premium Users</p>
            <p className="text-h2 text-primaryColorBlue">
              {userGrowthData.totalUserPremium}
            </p>
          </div>
        </div>
        <div className="w-1/5 flex justify-center items-center gap-3 px-4 py-1 bg-secondColorBg shadow-sm shadow-primaryColorBlue rounded-md">
          <div className="w-18 h-18 bg-primaryColorBg rounded-full flex items-center justify-center">
            <TbUserCheck className="w-10 h-10 text-primaryColorPink" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-textBig">Regular Users</p>
            <p className="text-h2 text-primaryColorBlue">
              {userGrowthData.totalUserFree}
            </p>
          </div>
        </div>
      </div>
      <div className=" w-[90%] p-4 flex flex-col items-start rounded-xl gap-4">
        <div className="w-full flex items-center justify-between px-3 mb-3">
          <h1 className="text-h2 text-primaryColorPink">List User</h1>
        </div>
        <ListUser data={listUsersData} page={page} />
        <PaginationWithLinks page={page} totalPage={totalPage} />
      </div>
    </div>
  );
}

export default Page;
