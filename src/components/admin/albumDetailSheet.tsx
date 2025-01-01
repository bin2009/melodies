"use client";
import React, { useEffect, useState } from "react";
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
import Image from "next/image";
import albumImg from "@/assets/img/placeholderPlaylist.png";
import artistImg from "@/assets/img/placeholderUser.jpg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/app/AppProvider";

interface Album {
  albumId: string;
  title: string;
  releaseDate: string;
  albumType: string;
  createdAt: string;
  totalSong: string;
  artistMain: artistMain;
  albumImages: string[];
}

interface artistMain {
  id: string;
  name: string;
  avatar: string;
  bio: string | null;
  createdAt: string;
  genres: Genre[];
}

interface Genre {
  genreId: string;
  name: string;
}

interface AlbumDetailProps {
  albumId: string;
  onClose: () => void;
}

const AlbumDetailSheet: React.FC<AlbumDetailProps> = ({ albumId, onClose }) => {
  const [albumDetail, setAlbumDetail] = useState<Album | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [albumImgEdit, setAlbumImgEdit] = useState<File | null>(null);
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [listSongOfMainArtist, setListSongOfMainArtist] = useState<string[]>(
    []
  );
  const [selectedSongs, setSelectedSongs] = useState<
    { id: string; title: string }[]
  >([]);
  const [openListSong, setOpenListSong] = React.useState(false);
  const [typeAlbum, setTypeAlbum] = useState<string>("");
  const { toast } = useToast();
  const { accessToken } = useAppContext();

  const typeColors = {
    ep: "!text-green-500",
    single: "!text-yellow-500",
    album: "!text-pink-500",
  };

  useEffect(() => {
    const fetchAlbumDetail = async () => {
      try {
        const response = await fetchApiData(
          `/api/album/${albumId}`,
          "GET",
          null,
          accessToken
        );
        if (!response.success) {
          throw new Error("Failed to fetch album details.");
        }
        setAlbumDetail(response.data.album);
        const albumData = response.data.album;
        // setAlbumImages(albumData.albumImages?[0].image?[0]);
        setAlbumImages(albumData.albumImages?.[0]?.image);
        setAlbumTitle(albumData.title);

        setSelectedSongs(albumData.songs || []);
        setTypeAlbum(albumData.albumType);

        const parsedReleaseDate = new Date(albumData.releaseDate);
        if (!isNaN(parsedReleaseDate.getTime())) {
          const formattedReleaseDate = parsedReleaseDate
            .toISOString()
            .split("T")[0];
          setReleaseDate(formattedReleaseDate);
        } else {
          console.warn(
            "Invalid release date format from API:",
            albumData.releaseDate
          );
        }

        if (albumData.artistMain.id) {
          await fetchSongsByArtist(albumData.artistMain.id);
        }
      } catch (error) {
        console.error("Error fetching album details:", error);
      }
    };

    if (albumId) fetchAlbumDetail();
  }, [albumId]);

  const fetchSongsByArtist = async (artistId: string) => {
    try {
      const response = await fetchApiData(
        `/api/artist/song/${artistId}`,
        "GET",
        null,
        accessToken
      );
      if (response.success) {
        setListSongOfMainArtist(response.data.songs);
        console.log("List songs of main artist:", response.data.songs);
      } else {
        console.error("Failed to fetch songs:", response.error);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const handleSongChange = (song: { id: string; title: string }) => {
    if (typeAlbum === "single") {
      setSelectedSongs([song]);
      // setReorderedSong([song]);
      setOpenListSong(false);
      return;
    }
    // Toggle the selection state of the song
    setSelectedSongs((prevSongs) => {
      if (prevSongs.some((s) => s.id === song.id)) {
        // Song is already selected, so remove it
        return prevSongs.filter((s) => s.id !== song.id);
      } else {
        // Song is not selected, so add it
        return [...prevSongs, song];
      }
    });
  };

  useEffect(() => {
    if (typeAlbum === "single" && selectedSongs.length > 0) {
      setOpenListSong(false);
    }
  }, [selectedSongs, typeAlbum]);

  const handleSelectChange = (value: string) => {
    setTypeAlbum(value);
    if (value === "single" && selectedSongs.length > 1) {
      // Nếu chuyển sang "single", chỉ giữ lại bài hát đầu tiên
      setSelectedSongs([selectedSongs[0]]);
      // setReorderedSong([selectedSongs[0]]);
    }
  };

  const orderedSongs = [
    ...listSongOfMainArtist.filter((song) =>
      selectedSongs.some((selected) => selected.id === song.id)
    ),
    ...listSongOfMainArtist.filter(
      (song) => !selectedSongs.some((selected) => selected.id === song.id)
    ),
  ];

  const handleAlbumImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        e.target.value = "";
        setAlbumImgEdit(null);
        toast({
          title: "Error",
          description: "File size should not exceed 10MB",
          variant: "destructive",
        });
        // alert("File size should not exceed 10MB");
        return;
      } else {
        setAlbumImgEdit(file);
        const previewUrl = URL.createObjectURL(file);
        setAlbumImages(previewUrl);
      }
    }
  };


  const handleUpdate = async (albumData: {
    title: string;
    releaseDate: string;
    albumType: string;
    songIds: string[];
    albumCover: File | null;
  }) => {
    const { title, releaseDate, albumType, songIds, albumCover } = albumData;

    const data = {
      title,
      releaseDate,
      albumType,
      songIds,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (albumCover) {
      formData.append("albumCover", albumCover);
    }

    try {
      const response = await fetchApiData(
        `/api/admin/update/album/${albumId}`,
        "PATCH",
        formData,
        accessToken,
        null
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Album "${title}" updated successfully.`,
          variant: "success",
        });
        window.location.reload();
      } else {
        alert("Error: " + response.error);
      }
    } catch (error) {
      console.error("Error updating album:", error);
      alert("An error occurred while sending the data.");
    }

    console.log("update album:", data);
  };

  const handleUpdateClick = () => {
    if (
      !albumTitle.trim() ||
      !typeAlbum ||
      !releaseDate ||
      !selectedSongs.length
    ) {
      toast({
        title: "Error",
        description: "Please provide required information before adding.",
        variant: "destructive",
      });
      return;
    }
    const albumData = {
      title: albumTitle,
      releaseDate: releaseDate,
      albumType: typeAlbum,
      songIds: selectedSongs.map((song) => song.id),
      albumCover: albumImgEdit,
    };

    handleUpdate(albumData);
  };

  return (
    <Sheet open={!!albumId} onOpenChange={onClose}>
      <SheetContent className="max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
        {/* <SheetContent> */}
        <SheetHeader>
          <SheetTitle>Album Details</SheetTitle>
          <SheetDescription>
            Detailed information about the album.
          </SheetDescription>
        </SheetHeader>
        {albumDetail ? (
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid justify-center items-center gap-4">
              <Image
                src={albumImages || albumImg}
                alt="Album Image"
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
                onChange={handleAlbumImgChange}
                className="text-center"
              />
            </div>

            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title">
                Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="Enter track title"
                className="col-span-3 border-primaryColorBlueHover"
              />
            </div>
            {/* Album Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="typeAlbum" className="text-left text-textMedium">
                Type Album<span className="text-red-500">*</span>
              </label>
              <div className="col-span-3">
                <Select value={typeAlbum} onValueChange={handleSelectChange}>
                  <SelectTrigger  className={`w-full border-primaryColorBlue ${
                      typeColors[typeAlbum] || ""
                    }`}>
                    <SelectValue placeholder="Select type of album" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ep" className="text-green-500">
                        EP
                      </SelectItem>
                      <SelectItem value="single" className="text-yellow-500">
                        Single
                      </SelectItem>
                      <SelectItem value="album" className="text-pink-500">
                        Album
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Main artist */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>
                Main Artist<span className="text-red-500">*</span>
              </Label>
              <div className="flex col-span-3 items-center ">
                <Image
                  src={albumDetail.artistMain?.avatar || artistImg}
                  alt="Artist"
                  width={50}
                  height={50}
                  className="rounded-lg w-10 h-10 mr-2"
                />
                <Label className=" border-primaryColorBlueHover px-2 ">
                  {albumDetail.artistMain?.name || "Not found"}
                </Label>
              </div>
            </div>

            {/* Release Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="releaseDate"
                className="text-left text-textMedium"
              >
                Release Date<span className="text-red-500">*</span>
              </label>
              <div className="col-span-3">
                <input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  className="calendar-icon w-full border-primaryColorBlue border p-2 rounded-md bg-slate-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColorBlue"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>
            </div>

            {/* List songs */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subArtists" className="text-left">
                List songs<span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 border-darkBlue">
                <Popover open={openListSong} onOpenChange={setOpenListSong}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openListSong}
                      className="w-full justify-between border-darkBlue col-span-3 truncate"
                      disabled={!albumDetail?.artistMain || !typeAlbum}
                    >
                      Edit songs of main artist
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 border-darkBlue">
                    <Command>
                      <CommandInput
                        placeholder="Search songs..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No song found.</CommandEmpty>
                        <ScrollArea className="h-40">
                          <CommandGroup>
                            {orderedSongs.map((song) => (
                              <CommandItem
                                key={song.id}
                                onSelect={() => handleSongChange(song)}
                              >
                                {song.title}
                                <CheckIcon
                                  className={`ml-auto h-4 w-4 ${
                                    selectedSongs.some((s) => s.id === song.id)
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
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="space-y-2 col-span-4">
                {selectedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between gap-2 p-2 border rounded-md border-darkBlue bg-gray-800 hover:bg-darkerBlue cursor-pointer"
                  >
                    <span>{song.title}</span>
                    <Cross2Icon
                      className="text-primaryColorPink h-6 w-6 flex-shrink-0 cursor-pointer"
                      onClick={() =>
                        setSelectedSongs((prevSongs) =>
                          prevSongs.filter((s) => s.id !== song.id)
                        )
                      }
                    />
                  </div>
                ))}
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
            Update Album
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AlbumDetailSheet;
