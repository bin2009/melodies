import { SewingPinIcon } from "@radix-ui/react-icons";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  PlusIcon,
  Pencil2Icon,
  Pencil1Icon,
  CheckIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { toast } from "@/hooks/use-toast";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { useGenreContext } from "@/components/provider/genreProvider";

const Genre: React.FC = () => {
  const { listGenres, setListGenres } = useGenreContext();
  const [isAdding, setIsAdding] = useState(false);
  const [genreName, setGenreName] = useState("");
  const { accessToken } = useAppContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingGenreId, setEditingGenreId] = useState(null);
  const inputRef = useRef(null);
  const handleAddGenre = async () => {
    if (!genreName.trim()) {
      toast({
        title: "Error",
        description: "Genre name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetchApiData(
        "/api/admin/create/genre",
        "POST",
        JSON.stringify({ name: genreName }),
        accessToken
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Genre "${genreName}" has been added successfully.`,
          variant: "success",
        });
        setListGenres([
          { genreId: response.data.genre.genreId, name: genreName },
          ...listGenres,
        ]);
        setGenreName("");
        setIsAdding(false);
      } else if (response.error === "Genre exists") {
        toast({
          title: "Duplicate Genre",
          description: "This genre already exists. Please try another name.",
          variant: "destructive",
        });
      } else {
        throw new Error(response.error || "Unknown error occurred.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add genre. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add genre:", error);
    }
  };

  const handleEditGenre = (genreId: string, currentName: string) => {
    // console.log("Editing genre:", genreId, currentName);
    setEditingGenreId(genreId);
    setGenreName(currentName);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveGenre = async (genreId: string) => {
    if (!genreName.trim()) {
      toast({
        title: "Error",
        description: "Genre name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetchApiData(
        `/api/admin/update/genre/${genreId}`,
        "PATCH",
        JSON.stringify({ name: genreName }),
        accessToken
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Genre "${genreName}" has been updated successfully.`,
          variant: "success",
        });

        setListGenres(listGenres.map((genre) => (genre.genreId === genreId ? { ...genre, name: genreName } : genre)));
        setGenreName("");
      } else if (response.error === "Genre name already exists") {
        toast({
          title: "Duplicate Genre",
          description: "This genre already exists. Please try another name.",
          variant: "destructive",
        });
      } else {
        throw new Error(response.error || "Unknown error occurred.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update genre. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update genre:", error);
    }
    setIsUpdating(false);
    // console.log("Saving genre:", genreId, genreName);
    setEditingGenreId(null);
  };

  const handleDeleteGenre = async (genreId: string) => {
    try {
      const response = await fetchApiData(
        "/api/admin/delete/genre",
        "DELETE",
        JSON.stringify({ genreIds: [genreId] }),
        accessToken
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Genre has been deleted successfully.`,
          variant: "success",
        });
        setListGenres(listGenres.filter((genre) => genre.genreId !== genreId));
      } else {
        throw new Error(response.error || "Unknown error occurred.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete genre. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete genre:", error);
    }
    setIsUpdating(false);
    // console.log("Saving genre:", genreId, genreName);
    setEditingGenreId(null);
    // console.log("Deleting genre:", genreId);
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <button className="text-textMedium py-3 px-3 bg-primaryColorPink flex items-center rounded-md shadow-sm shadow-white/60  hover:bg-darkPinkHover transition-all duration-300">
            <SewingPinIcon className="text-white w-5 h-5 stroke-white" />
            Manage Genres
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex gap-1 items-center text-h1 text-primaryColorPink">
              <SewingPinIcon className="w-5 h-5 text-primaryColorPink" />
              Manage Genres
            </SheetTitle>
            <SheetDescription>
              Make changes and view list to your genre here.
            </SheetDescription>
          </SheetHeader>
          <hr className="my-4" />
          <div className="mt-3 flex flex-col gap-3">
            <h3 className="">List Genres</h3>
            <div className="flex justify-between px-2">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="text-textMedium py-2 px-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
              >
                <PlusIcon className="text-white w-4 h-4" />
                Add Genre
              </button>
              <button
                onClick={() => setIsUpdating(!isUpdating)}
                className="text-textMedium py-2 px-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
              >
                <Pencil2Icon className="text-white w-4 h-4" />
                Edit / Delete
              </button>
            </div>

            {/* Add Genre */}
            {isAdding && (
              <div className="flex items-center gap-2 px-2 py-2">
                <Input
                  placeholder="Enter new genre"
                  maxLength={150}

                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  className="flex-1 border-primaryColorBlueHover"
                />
                <Button onClick={handleAddGenre} className="shrink-0 p-2">
                  <CheckIcon className="w-5 h-5 text-primaryColorPinkHover" />
                </Button>
              </div>
            )}

            {/* List Genres */}
            <div className="max-h-[60vh] mt-2 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
              {listGenres && listGenres.length > 0 ? (
                listGenres.map((genre) => (
                  <div
                    key={genre.genreId}
                    className="flex items-center gap-2 py-2"
                  >
                    <Input
                      ref={editingGenreId === genre.genreId ? inputRef : null}
                      placeholder="Enter new genre"
                      maxLength={150}

                      value={
                        editingGenreId === genre.genreId
                          ? genreName
                          : genre.name
                      }
                      onChange={(e) => setGenreName(e.target.value)}
                      className="flex-1 border-primaryColorBlueHover capitalize truncate"
                      readOnly={editingGenreId !== genre.genreId}
                    />
                    {isUpdating && (
                      <div className="flex gap-2">
                        {editingGenreId === genre.genreId ? (
                          <Button
                            onClick={() => handleSaveGenre(genre.genreId)}
                            className="shrink-0 p-2"
                          >
                            <CheckIcon className="w-5 h-5 text-primaryColorPinkHover" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              handleEditGenre(genre.genreId, genre.name)
                            }
                            className="shrink-0 p-2 bg-transparent hover:bg-white"
                          >
                            <Pencil1Icon className="w-5 h-5 text-primaryColorPink" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteGenre(genre.genreId)}
                          className="shrink-0 p-2 bg-transparent hover:bg-white"
                        >
                          <TrashIcon className="w-5 h-5 text-primaryColorPinkHover" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No genres available.</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Genre;
