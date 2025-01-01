"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { useSearchParams } from "next/navigation";
import LoadingPage from "@/components/loadingPage";
import ListReportedCmt from "@/components/admin/listReportedCmt";
import ListAIReportCmt from "@/components/admin/listAIReportCmt";
import { PaginationWithLinks } from "@/components/paginationWithLinks";

function Page() {
  const { loading, setLoading } = useAppContext();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1", 10);
  const [listReportsAdmin, setListReportsAdmin] = useState([]);
  const [listAIReportsAdmin, setListAIReportsAdmin] = useState([]);
  const [showAICmt, setShowAICmt] = useState(false);
  const { accessToken } = useAppContext();
  const [totalPage, setTotalPage] = useState(1);
  const [totalAIPage, setTotalAIPage] = useState(1);
  const handleViewAICmt = () => {
    setShowAICmt((prev) => !prev);
  };

  const fetchUserReports = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const reportRespond = await fetchApiData(
          "/api/admin/allReport",
          "GET",
          null,
          accessToken,
          {
            page: page,
            type: "USER",
          }
        );

        if (reportRespond.success) {
          setListReportsAdmin(reportRespond.data.reports);
        setTotalPage(reportRespond.data.totalPage);

        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, accessToken]
  );

  const fetchAIReports = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const reportRespond = await fetchApiData(
          "/api/admin/allReport",
          "GET",
          null,
          accessToken,
          {
            page: page,
            type: "AI",
          }
        );

        if (reportRespond.success) {
        setListAIReportsAdmin(reportRespond.data.reports);
        setTotalAIPage(reportRespond.data.totalPage);

        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, accessToken]
  );

  useEffect(() => {
    if (!showAICmt) {
      fetchUserReports(page);
    } else {
      fetchAIReports(page);
    }
  }, [fetchUserReports, fetchAIReports, page, showAICmt]);
  if (loading) return <LoadingPage />;

  // Lọc danh sách AI comments
  // const aiComments = listReportsAdmin.filter((comment) => comment.status === "AI");
  // const reportedComments = listReportsAdmin.filter((comment) => comment.status !== "AI");
  return (
    <div className="w-full mt-20 m-6 p-8 flex flex-col items-start justify-center">
      <div className="w-1/4 flex gap-2 items-center my-3">
        <button
          onClick={handleViewAICmt}
          className="py-2 px-3 text-textMedium font-bold bg-primaryColorBlueHover flex items-center shrink-0 gap-2 rounded-md shadow-md hover:bg-darkBlueHover transition-all duration-300"
          aria-label={showAICmt ? "Hide AI Comments" : "View AI Comments"}
        >
          {showAICmt ? (
            <>
              Hide AI Detect Comments
              <ChevronUpIcon className="text-white w-5 h-5 stroke-white" />
            </>
          ) : (
            <>
              View AI Detect Comments
              <ChevronDownIcon className="text-white w-5 h-5 stroke-white" />
            </>
          )}
        </button>
      </div>

      {/* Render List */}
      {showAICmt ? (
          <ListAIReportCmt data={listAIReportsAdmin} page={page} />
      ) : (
          <ListReportedCmt data={listReportsAdmin} page={page}/>
        )}
        <PaginationWithLinks page={page} totalPage={showAICmt ? totalAIPage : totalPage} />

    </div>
  );
}

export default Page;
