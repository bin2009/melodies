"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import ListTracksAdmin from "@/components/admin/listTracksAdmin";
import { MdDeleteOutline } from "react-icons/md";
import React from "react";
import AddTrackSheet from "@/components/admin/addTrackSheet";
import LoadingPage from "@/components/loadingPage";
import { PaginationWithLinks } from "@/components/paginationWithLinks";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ConfirmDelete from "@/components/popup/confirmDelete";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

function Page() {
  const { toast } = useToast();
  const { loading, setLoading } = useAppContext();
  const [listTracksData, setListTracksData] = useState([]);
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1", 10);
  const [totalPage, setTotalPage] = useState(1);
  const [listArtistsData, setListArtistsData] = useState([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { accessToken } = useAppContext();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTrackAdmin = useCallback(
    async (page: number, query: string = "") => {
      setLoading(true);
      try {
        const responses = await Promise.all([
          fetchApiData("/api/admin/search/song", "GET", null, accessToken, {
            page: page,
            query: query,
          }),
          fetchApiData("/api/admin/allArtistName", "GET", null, accessToken),
        ]);
        // console.log("fetch")
        if (responses[0].success) {
          setListTracksData(responses[0].data.song);
          setTotalPage(responses[0].data.totalPage);
        }
        if (responses[1].success) {
          setListArtistsData(responses[1].data.artists);
        // console.log("listArtistsData", listArtistsData)

        }
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, setLoading]
  );
  console.log("listArtistsData", listArtistsData)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTrackAdmin(page, searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchTrackAdmin, page, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAddTrack = async (trackData: {
    title: string;
    mainArtistId: string;
    subArtistIds: string[];
    audioFile: File;
    releaseDate: string;
    lyricFile: File;
  }) => {
    const {
      title,
      mainArtistId,
      subArtistIds,
      audioFile,
      releaseDate,
      lyricFile,
    } = trackData;
    const data = {
      title,
      mainArtistId,
      subArtistIds: subArtistIds.map((id) => ({ artistId: id })),
      releaseDate,
    };
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    formData.append("audioFile", audioFile);
    formData.append("lyricFile", lyricFile);

    try {
      const response = await fetchApiData(
        "/api/admin/create/song",
        "POST",
        formData,
        accessToken
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Track "${title}" added successfully.`,
          variant: "success",
        });
        fetchTrackAdmin(page, searchQuery);
      } else {
        toast({
          title: "Error",
          description: `Error "${response.error}".`,
          variant: "destructive",
        });
        // alert("Error: " + response.error);
      }
    } catch (error) {
      console.error("Error adding track:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending the data.",
        variant: "destructive",
      });
      // alert("An error occurred while sending the data.");
    }
    console.log("New track added:", trackData);
  };

  const handleDeleteTracks = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one track to delete.",
        variant: "destructive",
      });
      return;
    }
    try {
      const requestBody = JSON.stringify({ songIds: selectedItems });

      const response = await fetchApiData(
        "/api/admin/delete/song",
        "DELETE",
        requestBody,
        accessToken,
        null
      );

      if (response.success) {
        fetchTrackAdmin(page, searchQuery);
        toast({
          title: "Success",
          description: "Tracks deleted successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete tracks.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting albums:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting tracks.",
        variant: "destructive",
      });
    } finally {
      setSelectedItems([]);
    }
    setShowConfirmDelete(false);
    console.log("Deleting tracks:", { songIds: selectedItems });
  };
  const handleOpenConfirmDelete = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one track to delete.",
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
          <h1 className="text-h2 text-primaryColorPink">List Tracks</h1>
          <div
            id="search-header"
            className="w-1/3 h-[35px] flex bg-transparent border border-darkBlueHover items-center px-2 rounded-full"
          >
            <MagnifyingGlassIcon className="w-[20px] h-[20px] text-primaryColorBlue font-extrabold" />
            <input
              type="text"
              placeholder="Search for track"
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
              Delete Track
            </button>
            <AddTrackSheet onSave={handleAddTrack} artist={listArtistsData} />
          </div>
        </div>
      </div>
      <ListTracksAdmin
        data={listTracksData}
        page={page}
        onSelectedItemsChange={setSelectedItems}
      />
      <PaginationWithLinks page={page} totalPage={totalPage} />
      {showConfirmDelete && (
        <ConfirmDelete
          onClose={() => setShowConfirmDelete(false)}
          onDelete={handleDeleteTracks}
          entityName="track"
        />
      )}
    </div>
  );
}

export default Page;
