"use client";
import { MdDeleteOutline } from "react-icons/md";
import ListArtistAdmin from "@/components/admin/listArtistAdmin";
import AddArtistSheet from "@/components/admin/addArtistSheet";
import { useEffect, useState, useCallback } from "react";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { PaginationWithLinks } from "@/components/paginationWithLinks";
import { useSearchParams } from "next/navigation";
import LoadingPage from "@/components/loadingPage";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast"
import Genre from "@/components/genre";
import ConfirmDelete from "@/components/popup/confirmDelete";
interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string | null;
  createdAt: string;
  totalSong: string;
  totalAlbum: number;
  totalFollow: string;
}

function Page() {
  const { loading, setLoading } = useAppContext();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1", 10);
  const [totalPage, setTotalPage] = useState(1);
  const [listArtistsAdminData, setListArtistsAdminData] = useState<Artist[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast()
  const { accessToken } = useAppContext()
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchArtists = useCallback(async (page: number, query: string = '') => {
    setLoading(true);
    try {
      const artistsResponse = await fetchApiData("/api/admin/search/artist", "GET", null, accessToken, {
        page: page,
        query: query,
      });
  
      if (artistsResponse.success) {
        setListArtistsAdminData(artistsResponse.data.artists);
        setTotalPage(artistsResponse.data.totalPage);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nghệ sĩ:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, setLoading]);


  useEffect(() => {
    const handler = setTimeout(() => {
      fetchArtists(page, searchQuery);
    }, 500); 

    return () => {
      clearTimeout(handler); 
    };
  }, [fetchArtists, page, searchQuery]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAddArtist = async (artistData: { name: string; bio: string; avatar: File | null; genre: string[] }) => {
    const { name, bio, avatar, genre } = artistData;
    const data = {
      name,
      bio,
      genres: genre.map(id => ({ genreId: id })),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (avatar) {
      formData.append("avatar", avatar);
    }
    try {
      const response = await fetchApiData('/api/admin/create/artist', 'POST', formData, accessToken, null);
  
      if (response.success) {
        toast({
          title: "Success",
          description: `Artist "${name}" added successfully.`,
          variant: "success",
        });
        fetchArtists(page, searchQuery);
      } else {
        alert('Error: ' + response.error);
      }
    } catch (error) {
      console.error('Error adding artist:', error);
      alert('An error occurred while sending the data.');
    }
  };

  const handleDeleteArtist = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one artist to delete.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const requestBody = JSON.stringify({ artistIds: selectedItems });
      const response = await fetchApiData(
        "/api/admin/delete/artist",
        "DELETE",
        requestBody, 
        accessToken, 
        null 
      );
  
      if (response.success) {
        fetchArtists(page, searchQuery);
  
        toast({
          title: "Success",
          description: "Artist deleted successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete artist.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting artist:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting artist.",
        variant: "destructive",
      });
    } finally {
      setSelectedItems([]);
    }
    setShowConfirmDelete(false);
  };
  const handleOpenConfirmDelete = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one artist to delete.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDelete(true);
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="w-full mt-20 m-6 p-8 flex flex-col items-center justify-center">
      <div className="w-[90%] py-3 flex flex-col items-center justify-center rounded-xl">
        <div className="w-full flex items-center justify-between px-3 mb-3">
          <h1 className="text-h2 text-primaryColorPink">List Artists</h1>
          <div
            id="search-header"
            className="w-1/3 h-[35px] flex bg-transparent border border-darkBlueHover items-center px-2 rounded-full"
          >
            <MagnifyingGlassIcon className="w-[20px] h-[20px] text-primaryColorBlue font-extrabold" />
            <input
              type="text"
              placeholder="Search for artist"
              className="ml-2 py-2 pr-2 bg-transparent border-none outline-none placeholder:text-white/70"
              maxLength={150}

              value={searchQuery}
              onChange={handleSearchChange}
           />
          </div>
          <div className="flex gap-4">
            <Genre />
            <button className="text-textMedium font-bold p-3 flex items-center gap-2 bg-transparent border border-primaryColorBlue text-primaryColorBlue rounded-md  hover:text-darkBlueHover transition-all duration-300"
            onClick={handleOpenConfirmDelete}>
              <MdDeleteOutline className="text-primaryColorBlue w-5 h-5 hover:text-darkBlue stroke-primaryColorBlue" />

              Delete Artist
            </button>

            <AddArtistSheet onSave={handleAddArtist}/>
          </div>
        </div>
      </div>
      <ListArtistAdmin data={listArtistsAdminData} page={page} onSelectedItemsChange={setSelectedItems}/>
      <PaginationWithLinks page={page} totalPage={totalPage} />
      {showConfirmDelete && (
        <ConfirmDelete
          onClose={() => setShowConfirmDelete(false)}
          onDelete={handleDeleteArtist}
          entityName="artist" 
        />
      )}
    </div>
  );
}

export default Page;
