"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import Image from "next/image";
import artistimg from "@/assets/img/placeholderUser.jpg";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { useToast } from "@/hooks/use-toast";

interface Artist {
  id: string;
  name: string;
  avatar: string;
}
interface AddAlbumSheetProps {
  onSave: (albumData: {
    title: string;
    mainArtistId: string;
    type: string;
    songIds: string[];
    albumCover: File;
    releaseDate: string;
  }) => void;
  artist: Artist[];
}

const AddAlbumSheet: React.FC<AddAlbumSheetProps> = ({ onSave, artist }) => {
  const [albumTitle, setAlbumTitle] = React.useState("");
  const [mainArtist, setMainArtist] = React.useState("");
  const [openMainArtist, setOpenMainArtist] = React.useState(false);
  const [openListSong, setOpenListSong] = React.useState(false);
  const [albumImg, setAlbumImg] = useState<File | null>(null);
  const [listArtist, setListArtist] = React.useState<Artist[]>(artist || []);
  const [listSongOfMainArtist, setListSongOfMainArtist] = React.useState<
    { id: string; title: string }[]
  >([]);
  const [selectedSongs, setSelectedSongs] = React.useState<
    { id: string; title: string }[]
  >([]);
  const [reorderedSong, setReorderedSong] = React.useState<
    { id: string; title: string }[]
  >([]);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [typeAlbum, setTypeAlbum] = useState<string>("");
  const { accessToken } = useAppContext();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const typeColors = {
    ep: "!text-green-500",
    single: "!text-yellow-500",
    album: "!text-pink-500",
  };

  React.useEffect(() => {
    setListArtist((prevList) =>
      prevList.map((item) => ({
        ...item,
        selected: mainArtist === item.id,
      }))
    );
    if (!mainArtist) {
      setListSongOfMainArtist([]);
      setSelectedSongs([]);
    }
  }, [mainArtist]);

  const handleMainArtistSelect = async (selectedArtist: Artist) => {
    setOpenMainArtist(false);

    if (mainArtist === selectedArtist.id) {
      resetMainArtist(selectedArtist.id);
    } else {
      selectMainArtist(selectedArtist);

      try {
        const response = await fetchApiData(
          `/api/artist/song/${selectedArtist.id}`,
          "GET",
          null,
          accessToken
        );

        if (response.success) {
          const { songs } = response.data;
          setListSongOfMainArtist(songs);
          setReorderedSong(songs);
          setSelectedSongs([]); 
        } else {
          console.error("Failed to fetch songs:", response.error);
          resetSongs();
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
        resetSongs();
      }
    }
  };

  const resetMainArtist = (artistId: string) => {
    setMainArtist("");
    setListArtist((prevList) =>
      prevList.map((artist) =>
        artist.id === artistId ? { ...artist, selected: false } : artist
      )
    );
    resetSongs();
  };

  const selectMainArtist = (artist: Artist) => {
    setMainArtist(artist.id);
    setListArtist((prevList) => [
      { ...artist, selected: true },
      ...prevList.filter((item) => item.id !== artist.id),
    ]);
  };

  const resetSongs = () => {
    setListSongOfMainArtist([]);
    setReorderedSong([]);
    setSelectedSongs([]);
  };

  const handleSongChange = (song: { id: string; title: string }) => {
    if (typeAlbum === "single") {
      setSelectedSongs([song]);
      // setReorderedSong([song]);
      setOpenListSong(false);
      return;
    }

    setSelectedSongs((prevSelected) =>
      prevSelected.some((s) => s.id === song.id)
        ? prevSelected.filter((s) => s.id !== song.id)
        : [...prevSelected, song]
    );

    setReorderedSong((prevSongs) => {
      // Nếu bài hát đã có trong danh sách, đưa nó lên đầu
      if (prevSongs.some((s) => s.id === song.id)) {
        return [song, ...prevSongs.filter((s) => s.id !== song.id)];
      }
      return [song, ...prevSongs];
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

  const handleAlbumImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        e.target.value = "";
        setAlbumImg(null);
        // alert("File size should not exceed 10MB");
        toast({
          title: "Error",
          description: "File size should not exceed 10MB",
          variant: "destructive",
        });
        return;
      } else {
        setAlbumImg(file);
      }
    }
  };

  const handleSave = () => {
    if (
      !albumTitle.trim() ||
      !mainArtist ||
      !typeAlbum ||
      !releaseDate ||
      !selectedSongs.length ||
      !albumImg
    ) {
      toast({
        title: "Error",
        description: "Please provide required information before adding.",
        variant: "destructive",
      });
      return;
    }
    if (albumImg) {
      onSave({
        title: albumTitle,
        mainArtistId: mainArtist,
        type: typeAlbum,
        songIds: selectedSongs.map((song) => song.id),
        albumCover: albumImg,
        releaseDate: releaseDate,
      });
    }

    setAlbumTitle("");
    setMainArtist("");
    setTypeAlbum("");
    setListSongOfMainArtist([]);
    setSelectedSongs([]);
    setAlbumImg(null);
    setReleaseDate("");
  };

  return (
    <div className="">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <button className="text-textMedium p-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover">
            <PlusIcon className="text-white w-5 h-5" />
            Add New Album
          </button>
        </SheetTrigger>
        <SheetContent className="max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
          <SheetHeader>
            <SheetTitle className="text-primaryColorPink">
              Add New Album
            </SheetTitle>
            <SheetDescription>
              Enter details to add a new album.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4 items-start">
            {/* title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackTitle" className="text-left">
                Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="albumTitle"
                maxLength={150}
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="Enter album title"
                className="col-span-3 border-darkBlue"
              />
            </div>
            {/* Main Aritst */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mainArtist" className="text-left">
                Main Artist<span className="text-red-500">*</span>
              </Label>
              <Popover open={openMainArtist} onOpenChange={setOpenMainArtist}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMainArtist}
                    className="w-full justify-between border-darkBlue col-span-3 truncate"
                  >
                    {mainArtist
                      ? listArtist.find((a) => a.id === mainArtist)?.name
                      : "Select main artist"}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-darkBlue">
                  <Command>
                    <CommandInput
                      placeholder="Search artist..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No artist found.</CommandEmpty>
                      <ScrollArea className="h-40">
                        <CommandGroup>
                          {listArtist.map((artist) => (
                            <CommandItem
                              key={artist.id}
                              onSelect={() => handleMainArtistSelect(artist)}
                            >
                              <Image
                                src={artist.avatar || artistimg}
                                alt={artist.name}
                                width={50}
                                height={50}
                                className="rounded-lg w-8 h-8 mr-2"
                              />

                              {artist.name}
                              <CheckIcon
                                className={`ml-auto h-4 w-4 ${
                                  artist.id === mainArtist
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
            {/* Type */}

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="typeAlbum" className="text-left text-textMedium">
                Type Album<span className="text-red-500">*</span>
              </label>
              <div className="col-span-3">
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger
                    className={`w-full border-primaryColorBlue ${
                      typeColors[typeAlbum] || ""
                    }`}
                  >
                    <SelectValue placeholder="Select type of album" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ep" className="text-green-500">EP</SelectItem>
                      <SelectItem value="single" className="text-yellow-500">Single</SelectItem>
                      <SelectItem value="album" className="text-pink-500">Album</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Album img */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ablumImg" className="text-left">
                Album Image<span className="text-red-500">*</span>
              </Label>
              <Input
                id="ablumImg"
                type="file"
                accept="image/*"
                onChange={handleAlbumImgChange}
                className="col-span-3 border-darkBlue"
              />
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
                  type="date"
                  className="calendar-icon w-full border-primaryColorBlue border p-2 rounded-md bg-slate-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColorBlue"
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>
            </div>
            {/* List song */}
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
                      disabled={!mainArtist || !typeAlbum}
                    >
                      Select songs of main artist
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
                            {reorderedSong.map((song) => (
                              <CommandItem
                                className=""
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

            {/* Song */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="space-y-2 col-span-4">
                {selectedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between gap-2 p-2 border rounded-md border-darkBlue bg-gray-800  hover:bg-darkerBlue cursor-pointer"
                  >
                    <span>{song.title}</span>
                    <Cross2Icon
                      className="text-primaryColorPink h-6 w-6 flex-shrink-0 cursor-pointer"
                      onClick={() =>
                        setSelectedSongs((prevSongs) =>
                          prevSongs.filter((s) => s.id !== song.id)
                        )
                      }
                    ></Cross2Icon>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter>
            {/* <SheetClose asChild>
            </SheetClose> */}
            <Button
              onClick={handleSave}
              type="submit"
              className="text-textMedium p-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
            >
              Save Album
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AddAlbumSheet;
