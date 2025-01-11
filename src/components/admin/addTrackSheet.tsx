"use client";
import Image from "next/image";
import artistimg from "@/assets/img/placeholderUser.jpg";
import React, { useRef, useState } from "react";
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
import { PlusIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { title } from "process";
import { useToast } from "@/hooks/use-toast"

interface Artist {
  id: string;
  name: string;
  avatar: string;
}
interface AddTrackSheetProps {
  onSave: (trackData: {
    title: string;
    mainArtistId: string;
    subArtistIds: string[];
    audioFile: File;
    releaseDate: string;
    lyricFile: File | null;
  }) => void;
  artist: Artist[];
}

const AddTrackSheet: React.FC<AddTrackSheetProps> = ({ onSave, artist }) => {
  const [trackTitle, setTrackTitle] = React.useState("");
  const [mainArtist, setMainArtist] = React.useState("");
  const [subArtists, setSubArtists] = React.useState<string[]>([]);
  const [openMainArtist, setOpenMainArtist] = React.useState(false);
  const [openSubArtist, setOpenSubArtist] = React.useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [lyricFile, setLyricFile] = useState<File | null>(null);
  const [listArtist, setListArtist] = React.useState<Artist[]>(artist || []);
  const originalOrder = React.useRef<Artist[]>(artist || []);
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  React.useEffect(() => {
    setListArtist((prevList) =>
      prevList.map((item) => ({
        ...item,
        selected: mainArtist === item.id,
      }))
    );
    if (!mainArtist) {
      setSubArtists([]);
    }
  }, [mainArtist]);

  const handleMainArtistSelect = async (selectedArtist: Artist) => {
    if (mainArtist === selectedArtist.id) {
      setMainArtist("");
      setListArtist((prevList) =>
        prevList.map((artist) =>
          artist.id === selectedArtist.id
            ? { ...artist, selected: false }
            : artist
        )
      );
    } else {
      setMainArtist(selectedArtist.id);
      setListArtist((prevList) => [
        { ...selectedArtist, selected: true },
        ...prevList.filter((artist) => artist.id !== selectedArtist.id),
      ]);
    }
    setOpenMainArtist(false);
  };

  const handleSubArtistChange = (artist: Artist) => {
    if (artist.id === mainArtist) return;

    setSubArtists((prevArtists) => {
      const isAlreadySelected = prevArtists.includes(artist.id);

      if (isAlreadySelected) {
        // Bỏ chọn -> trả lại vị trí cũ
        setListArtist((prevList) => {
          const updatedList = prevList.filter((item) => item.id !== artist.id);
          const originalArtist = originalOrder.current.find(
            (item) => item.id === artist.id
          );
          if (originalArtist) {
            const index = originalOrder.current.indexOf(originalArtist);
            updatedList.splice(index, 0, originalArtist);
          }
          return updatedList;
        });
        return prevArtists.filter((id) => id !== artist.id);
      } else {
        setListArtist((prevList) => [
          artist,
          ...prevList.filter((item) => item.id !== artist.id),
        ]);
        return [...prevArtists, artist.id];
      }
    });
  };


  const handleSave = () => {
    if (!trackTitle.trim() || !mainArtist || !releaseDate || !audioFile) {
      toast({
        title: "Error",
        description: "Please provide required information before adding.",
        variant: "destructive",
      });
      return;
    }
  
    if (audioFile) {
      onSave({
        title: trackTitle,
        mainArtistId: mainArtist,
        subArtistIds: subArtists,
        releaseDate: releaseDate,
        audioFile: audioFile,
        lyricFile: lyricFile,
      });
      console.log("Track saved with release_date:", releaseDate);
  
      // Reset fields
      setTrackTitle("");
      setMainArtist("");
      setSubArtists([]);
      setAudioFile(null);
      setReleaseDate("");
      setLyricFile(null);
  
      // Close Sheet
      setIsSheetOpen(false);
    } else {
      console.error("Audio file is required.");
    }
  };
  
  
  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        event.target.value = "";
        setAudioSrc(null);
        toast({
          title: "Error",
          description: "File size should not exceed 30MB",
          variant: "destructive",
        });
        // alert("File size should not exceed 30MB");
        return;
      }
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
  
      audio.onloadedmetadata = () => {
        const maxDuration = 20 * 60; // 20 phut thanh giay
        if (audio.duration > maxDuration) {
          event.target.value = "";
          setAudioSrc(null);
          URL.revokeObjectURL(url);
          toast({
            title: "Error",
            description: "Audio duration should not exceed 20 minutes",
            variant: "destructive",
          });
          // alert("Audio duration should not exceed 20 minutes");
          return;
        }
        
      setAudioFile(file);

      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }

      // const url = URL.createObjectURL(file);
      setAudioSrc(url);
    };
      audio.onerror = () => {
        alert("Could not load audio. Please try again with a valid file.");
        URL.revokeObjectURL(url);
      };
    }
  };

  const handleLyricChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; 
      if (file.size > maxSize) {
        event.target.value = "";
        toast({
          title: "Error",
          description: "File size should not exceed 10MB",
          variant: "destructive",
        });
        // alert("File size should not exceed 10MB");
        return;
      }
      if (file.type !== "application/json") {
        event.target.value = "";
        toast({
          title: "Error",
          description: "Only JSON files are allowed",
          variant: "destructive",
        });
        // alert("Only JSON files are allowed");
        return;
      }
      setLyricFile(file);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <button className="text-textMedium p-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover">
          <PlusIcon className="text-white w-5 h-5 stroke-white" />
          Add New Track
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-primaryColorPink">
            Add New Track
          </SheetTitle>
          <SheetDescription>Enter details to add a new track.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4 items-start">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trackTitle" className="text-left text-textMedium">
              Title<span className="text-red-500">*</span>
            </Label>
            <Input
              id="trackTitle"
              maxLength={150}

              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Enter track title"
              className="col-span-3 border-darkBlue" required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mainArtist" className="text-left text-textMedium">
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
                    required
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

          {/* Release Date */}

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="releaseDate" className="text-left text-textMedium">
              Release Date<span className="text-red-500">*</span>
            </label>
            <div className="col-span-3">
              <input
                id="releaseDate"
                type="date"
                className="calendar-icon w-full border-primaryColorBlue border p-2 rounded-md bg-slate-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColorBlue"
                // onChange={(e) => setReleaseDate(e.target.value)}
                onChange={(e) => {
                  const [year, month, day] = e.target.value.split("-"); 
                  const formattedDate = `${month}/${day}/${year} 00:00:00`; // Chuyển sang định dạng MM/dd/yyyy HH:mm:ss
                  setReleaseDate(formattedDate);
                }}
                required
              />
            </div>
          </div>

          {/* Sub Artist */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subArtists" className="text-left text-textMedium">
              Sub Artists
            </Label>
            <div className="col-span-3">
              <Popover open={openSubArtist} onOpenChange={setOpenSubArtist}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSubArtist}
                    className="w-full justify-between border-darkBlue col-span-3 truncate"
                    disabled={!mainArtist}
                  >
                    {subArtists.length > 0
                      ? subArtists
                          .map(
                            (id) =>
                              listArtist.find((artist) => artist.id === id)
                                ?.name
                          )
                          .filter(Boolean)
                          .join(", ")
                      : "Select sub artists"}
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
                          {listArtist
                            .filter((artist) => artist.id !== mainArtist) // Loại trừ mainArtist
                            .map((artist) => (
                              <CommandItem
                                key={artist.id}
                                onSelect={() => handleSubArtistChange(artist)}
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
                                    subArtists.includes(artist.id)
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
            <Label htmlFor="audio" className="text-left text-textMedium">
              Audio<span className="text-red-500">*</span>
            </Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="col-span-3 border-darkBlue"
              required
            />
          </div>
          <div>
            {audioSrc && (
              <div className="col-span-4 flex justify-center items-center my-2">
                <audio
                  controls
                  ref={audioRef}
                  key={audioSrc}
                  className="h-10 w-full"
                >
                  <source src={audioSrc} type="audio/mpeg" />
                  Your browser not support audio display.
                </audio>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lyric" className="text-left text-textMedium">
          Lyric File
        </Label>
        <Input
          id="lyric"
          type="file"
          accept="application/json"
          onChange={handleLyricChange}
          className="col-span-3 border-darkBlue"
        />
      </div>
      {/* <div>
        {lyricFile && (
          <div className="col-span-4 flex justify-center items-center my-2">
            <p className="text-sm text-success">
              {lyricFile.name} has been uploaded successfully.
            </p>
          </div>
        )}
      </div> */}

        </div>
        <SheetFooter>
            <Button
              onClick={handleSave}
              type="submit"
              className="text-textMedium p-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
            >
              Save Track
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddTrackSheet;
