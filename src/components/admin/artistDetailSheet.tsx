"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import Image from "next/image";
import {
  PlusIcon,
  CaretSortIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { fetchApiData } from "@/app/api/appService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/app/AppProvider";
import artistImg from "@/assets/img/placeholderUser.jpg";
import { useGenreContext } from "@/components/provider/genreProvider";
import AddGenre from "@/components/admin/addGenre";
import { GenreData } from "@/types/interfaces";

interface Genre {
  genreId: string;
  name: string;
}

interface ArtistDetail {
  id: string;
  name: string;
  avatar: string;
  bio: string | null;
  createdAt: string;
  genres: Genre[];
}

interface ArtistDetailProps {
  artistId: string;
  onClose: () => void;
}

const ArtistDetailSheet: React.FC<
  ArtistDetailProps & { onClose: () => void }
> = ({ artistId, onClose }) => {
  const [artistDetail, setArtistDetail] = useState<ArtistDetail | null>(null);
  const [artistImage, setArtistImage] = useState<string | null>(null);
  const [artistImgEdit, setArtistImgEdit] = useState<File | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artistBio, setArtistBio] = useState<string | null>(null);
  const [artistGenre, setArtistGenre] = useState<string[]>([]);
  // const [genreList, setGenreList] = useState<Genre[]>([]);
  const [openGenre, setOpenGenre] = useState(false);
  const { toast } = useToast();
  const { accessToken } = useAppContext();
  const { listGenres, setListGenres } = useGenreContext();

  useEffect(() => {
    const fetchArtistDetail = async () => {
      try {
        const response = await fetchApiData(
          `/api/artist/${artistId}`,
          "GET",
          null,
          accessToken
        );
        if (!response.success) {
          throw new Error("Failed to fetch artist details.");
        }
        setArtistDetail(response.data.artist);
        const artistData = response.data.artist;
        setArtistImage(artistData.avatar);
        setArtistName(artistData.name);
        setArtistBio(artistData.bio);
        setArtistGenre(artistData.genres.map((genre) => genre.genreId));
      } catch (error) {
        console.error("Error fetching artist details:", error);
      } finally {
      }
    };

    if (artistId) fetchArtistDetail();
  }, [artistId]);

  const handleArtistImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        e.target.value = "";
        setArtistImgEdit(null);
        // alert("File size should not exceed 10MB");
        toast({
          title: "Error",
          description: "File size should not exceed 10MB",
          variant: "destructive",
        });
        return;
      } else {
        setArtistImgEdit(file);
        const previewUrl = URL.createObjectURL(file);
        setArtistImage(previewUrl);
      }
    }
  };

  const handleAddGenre = (newGenre: GenreData) => {
    setListGenres([newGenre, ...listGenres]);
    console.log(newGenre);
  };

  const handleGenreChange = (genre: Genre) => {
    setArtistGenre((prevGenres) => {
      if (prevGenres.some((g) => g === genre.genreId)) {
        return prevGenres.filter((g) => g !== genre.genreId);
      } else {
        return [...prevGenres, genre.genreId];
      }
    });
  };

  const orderedGenres = [
    // Genres that are selected
    ...listGenres.filter((genre) => artistGenre.includes(genre.genreId)),
    // Genres that are not selected
    ...listGenres.filter((genre) => !artistGenre.includes(genre.genreId)),
  ];

  const handleUpdate = async (artistData: {
    name: string;
    bio: string;
    genres: string[];
    avatar: File | null;
  }) => {
    const { name, bio, genres, avatar } = artistData;

    const data = {
      name,
      bio,
      genres,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const response = await fetchApiData(
        `/api/admin/update/artist/${artistId}`,
        "PATCH",
        formData,
        accessToken,
        null
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Aritst "${name}" updated successfully.`,
          variant: "success",
        });
        window.location.reload();
      } else {
        alert("Error: " + response.error);
      }
    } catch (error) {
      console.error("Error updating artist:", error);
      alert("An error occurred while sending the data.");
    }

    console.log("update artist:", data);
  };

  const handleUpdateClick = () => {
    if (!artistName.trim() || artistGenre.length === 0) {
      toast({
        title: "Error",
        description: "Please provide required information before update.",
        variant: "destructive",
      });
      return;
    }

    const artistData = {
      name: artistName,
      bio: artistBio,
      genres: artistGenre,
      avatar: artistImgEdit,
    };

    handleUpdate(artistData);
  };

  return (
    <Sheet open={!!artistId} onOpenChange={onClose}>
      <SheetContent className="max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
        <SheetHeader>
          <SheetTitle>Artist Details</SheetTitle>
          <SheetDescription>
            Detailed information about the artist.
          </SheetDescription>
        </SheetHeader>
        {artistDetail ? (
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid justify-center items-center gap-4">
              <Image
                src={artistImage || artistImg}
                alt="Artist Image"
                width={100}
                height={100}
                className="rounded-md w-28 h-28"
              />
            </div>
            <div className="grid justify-center items-center gap-4">
              <Input
                id="ablumImg"
                type="file"
                accept="image/*"
                onChange={handleArtistImgChange}
                className="text-center"
              />
            </div>

            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title">
                Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                maxLength={150}
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Enter track title"
                className="col-span-3 border-primaryColorBlueHover"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="artistBio" className="text-left">
                Bio
              </Label>
              <textarea
                id="artistBio"
                value={artistBio}
                onChange={(e) => setArtistBio(e.target.value)}
                placeholder="Enter artist bio"
                className="col-span-3 border rounded p-2 border-darkBlue bg-primaryColorBg resize-none"
              />
            </div>
            {/* Genres */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genre">
                Genres<span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <Popover open={openGenre} onOpenChange={setOpenGenre}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center border-primaryColorBlueHover p-2"
                    >
                      <span className="truncate max-w-full capitalize">
                        {artistGenre.length > 0
                          ? listGenres
                              .filter((g) => artistGenre.includes(g.genreId))
                              .map((g) => g.name)
                              .join(", ")
                          : "Select genres"}
                      </span>
                      <CaretSortIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 capitalize">
                    <Command>
                      <CommandInput placeholder="Search genres..." />
                      <CommandList>
                        <CommandEmpty>No genres found.</CommandEmpty>
                        <ScrollArea className="h-40">
                          <AddGenre onAddGenre={handleAddGenre} />
                          <CommandGroup>
                            {orderedGenres.map((genre) => (
                              <CommandItem
                                key={genre.genreId}
                                onSelect={() => handleGenreChange(genre)}
                              >
                                {genre.name}
                                <CheckIcon
                                  className={`ml-auto h-4 w-4 ${
                                    artistGenre.includes(genre.genreId)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ) : (
          <p>No details available.</p>
        )}
        <SheetFooter>
          {/* <SheetClose asChild>
          </SheetClose> */}
          <Button
            type="submit"
            onClick={handleUpdateClick}
            className="text-textMedium p-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
          >
            Update Artist
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ArtistDetailSheet;
