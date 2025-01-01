"use client";
import AddAlbumSheet from "@/components/admin/addAlbumSheet";
import ListAlbumsAdmin from "@/components/admin/listAlbumsAdmin";
import React from "react";
import { MdDeleteOutline } from "react-icons/md";
import { useEffect, useState, useCallback } from "react";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { PaginationWithLinks } from "@/components/paginationWithLinks";
import { useSearchParams } from "next/navigation";
import LoadingPage from "@/components/loadingPage";
import { useToast } from "@/hooks/use-toast";
import ConfirmDelete from "@/components/popup/confirmDelete";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { DataAlbum } from "@/types/interfaces";

function Page() {
  const { loading, setLoading } = useAppContext();
  const [listAlbumsAdminData, setListAlbumsAdminData] = useState<DataAlbum[]>([]);
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1", 10);
  const [totalPage, setTotalPage] = useState(1);
  const [listArtistsData, setListArtistsData] = useState([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const { accessToken } = useAppContext();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAlbumsAdmin = useCallback(
    async (currentPage: number, query: string) => {
      setLoading(true);
      try {
        const responses = await Promise.all([
          fetchApiData("/api/admin/search/album", "GET", null, accessToken, {
            page: currentPage,
            query: query,
          }),
          fetchApiData("/api/admin/allArtistName", "GET", null, accessToken),
        ]);
        // console.log("fetch");
        if (responses[0].success) {
          setListAlbumsAdminData(responses[0].data.data);
          setTotalPage(responses[0].data.totalPage);
        }
        if (responses[1].success) {
          setListArtistsData(responses[1].data.artists);
        // console.log("listArtistsData", listArtistsData)

        }
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, setLoading]
  );
  console.log("listArtistsData", listArtistsData)

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAlbumsAdmin(page, searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchAlbumsAdmin, page, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAddAlbum = async (albumData: {
    title: string;
    mainArtistId: string;
    type: string;
    songIds: string[];
    albumCover: File;
    releaseDate: string;
  }) => {
    const { title, mainArtistId, type, songIds, albumCover, releaseDate } =
      albumData;
    const data = {
      title,
      mainArtistId,
      type,
      songIds: songIds.map((id) => ({ songId: id })),
      releaseDate,
    };
    console.log("New track added:", albumData);
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    formData.append("albumCover", albumCover);

    try {
      const response = await fetchApiData(
        "/api/admin/create/album",
        "POST",
        formData,
        accessToken
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Album "${title}" added successfully.`,
          variant: "success",
        });
        fetchAlbumsAdmin(page, searchQuery);
      } else {
        toast({
          title: "Error",
          description: `Error "${response.error}".`,
          variant: "destructive",
        });
        // alert("Error: " + response.error);
      }
    } catch (error) {
      console.error("Error adding album:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending the data.",
        variant: "destructive",
      });
      // alert("An error occurred while sending the data.");
    }
  };

  const handleDeleteAlbums = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one album to delete.",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestBody = JSON.stringify({ albumIds: selectedItems });

      const response = await fetchApiData(
        "/api/admin/delete/album",
        "DELETE",
        requestBody,
        accessToken,
        null
      );

      if (response.success) {
        fetchAlbumsAdmin(page, searchQuery);

        toast({
          title: "Success",
          description: "Albums deleted successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete albums.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting albums:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting albums.",
        variant: "destructive",
      });
    } finally {
      setSelectedItems([]);
    }
    setShowConfirmDelete(false);

    console.log("Deleting albums:", { albumIds: selectedItems });
  };

  const handleOpenConfirmDelete = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one album to delete.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDelete(true);
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="w-full my-20 m-6 p-8 ">
      <div className="p-4 flex flex-col items-start rounded-xl">
        <div className="w-full flex items-center justify-between px-3">
          <h1 className="text-h2 text-primaryColorPink">List Albums</h1>
          <div
            id="search-header"
            className="w-1/3 h-[35px] flex bg-transparent border border-darkBlueHover items-center px-2 rounded-full"
          >
            <MagnifyingGlassIcon className="w-[20px] h-[20px] text-primaryColorBlue font-extrabold" />
            <input
              type="text"
              placeholder="Search for album"
              className="ml-2 py-2 pr-2 bg-transparent border-none outline-none placeholder:text-white/70"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-4">
            <button
              className="text-textMedium p-3 flex items-center gap-2 bg-transparent border border-primaryColorBlue text-primaryColorBlue rounded-md hover:text-darkBlue"
              onClick={handleOpenConfirmDelete}
            >
              <MdDeleteOutline className="text-primaryColorBlue w-5 h-5 hover:text-darkBlue" />
              Delete Albums
            </button>

            <AddAlbumSheet onSave={handleAddAlbum} artist={listArtistsData} />
          </div>
        </div>
      </div>
      <ListAlbumsAdmin
        data={listAlbumsAdminData}
        page={page}
        onSelectedItemsChange={setSelectedItems}
      />
      <PaginationWithLinks page={page} totalPage={totalPage} />
      {showConfirmDelete && (
        <ConfirmDelete
          onClose={() => setShowConfirmDelete(false)}
          onDelete={handleDeleteAlbums}
          entityName="track"
        />
      )}
    </div>
  );
}

export default Page;
