"use client";
import Image from "next/image";
import artistimg from "@/assets/img/placeholderUser.jpg";
import trackImg from "@/assets/img/placeholderSong.jpg";
import React, { useEffect, useRef, useState } from "react";
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
import { fetchApiData } from "@/app/api/appService";
import { useArtistContext } from "@/components/provider/artistProvider";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/app/AppProvider";
import { decrypt } from "@/app/decode";

interface SimplifiedArtist {
  id: string;
  name: string;
  avatar: string;
}

interface ArtistSong {
  main: boolean;
}

interface Artist {
  id: string;
  name: string;
  avatar: string;
  ArtistSong: ArtistSong;
}

interface Album {
  title: string;
  albumImages: { image: string }[];
}

interface TrackDetail {
  id: string;
  title: string;
  duration: number;
  releaseDate: string;
  totalDownload: number;
  lyric: string;
  playCount: number;
  likeCount: number;
  totalComment: number;
  artists: Artist[];
  album: Album[];
}

interface TrackDetailProps {
  trackId: string;
  onClose: () => void;
}

const TrackDetailSheet: React.FC<TrackDetailProps> = ({ trackId, onClose }) => {
  const [trackDetail, setTrackDetail] = useState<TrackDetail | null>(null);
  const [trackTitle, setTrackTitle] = useState<string>("");
  const [openMainArtist, setOpenMainArtist] = useState(false);
  const [mainArtist, setMainArtist] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [subArtists, setSubArtists] = useState<string[]>([]);
  const [openSubArtist, setOpenSubArtist] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [lyric, setLyric] = useState<string>("");
  const [lyricFile, setLyricFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { accessToken } = useAppContext();
  //   const { listArtists } = useArtistContext();
  const { listArtists }: { listArtists: SimplifiedArtist[] } =
    useArtistContext();

  useEffect(() => {
    const fetchTrackDetail = async () => {
      try {
        const response = await fetchApiData(
          `/api/song/${trackId}`,
          "GET",
          null,
          accessToken
        );
        if (!response.success) {
          throw new Error("Failed to fetch track details.");
        }
        const trackData = response.data.song;
        setTrackDetail(trackData);
        setTrackTitle(trackData.title);
        setAudioSrc(trackData.filePathAudio);
        setLyric(trackData.lyric);

        const mainArtistData = trackData.artists.find(
          (artist: Artist) => artist.ArtistSong.main === true
        );
        if (mainArtistData) {
          setMainArtist(mainArtistData.id);
        }

        // Lọc các sub artists
        const subArtistsData = trackData.artists
          .filter((artist: Artist) => artist.ArtistSong.main === false)
          .map((artist: Artist) => artist.id);
        setSubArtists(subArtistsData);

        const parsedReleaseDate = new Date(trackData.releaseDate);
        if (!isNaN(parsedReleaseDate.getTime())) {
          const formattedReleaseDate = parsedReleaseDate
            .toISOString()
            .split("T")[0];
          setReleaseDate(formattedReleaseDate);
        } else {
          console.warn(
            "Invalid release date format from API:",
            trackData.releaseDate
          );
        }
      } catch (error) {
        console.error("Error fetching track details:", error);
      }
    };

    if (trackId) fetchTrackDetail();
  }, [trackId]);

  console.log("releaseDate", releaseDate);
  const handleMainArtistSelect = (artist: SimplifiedArtist) => {
    setMainArtist(artist.id);
    setOpenMainArtist(false);
  };

  const handleSubArtistSelect = (artist: SimplifiedArtist) => {
    setSubArtists((prev) => {
      if (prev.includes(artist.id)) {
        return prev.filter((id) => id !== artist.id);
      } else {
        return [...prev, artist.id];
      }
    });
    // setOpenSubArtist(false);
  };

  const mainArtistObj = listArtists.find((artist) => artist.id === mainArtist);
  const sortedArtists = mainArtistObj
    ? [
        mainArtistObj,
        ...listArtists.filter((artist) => artist.id !== mainArtist),
      ]
    : listArtists;

  // Sắp xếp sub artists để các nghệ sĩ đã chọn nằm trên cùng
  const orderedSubArtists = subArtists
    .map((id) => listArtists.find((artist) => artist.id === id))
    .filter(Boolean);
  const remainingArtists = listArtists.filter(
    (artist) => !subArtists.includes(artist.id) && artist.id !== mainArtist
    // (artist) => !subArtists.includes(artist.id)
  );

  const displayArtists = [...orderedSubArtists, ...remainingArtists];

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

  console.log("trackid", trackId);

  const handleUpdate = async (trackData: {
    title: string;
    mainArtist: string;
    subArtist: string[];
    audioFile: File | null;
    releaseDate: string;
    lyricFile: File | null;
  }) => {
    const { title, mainArtist, subArtist, audioFile, releaseDate, lyricFile } =
      trackData;

    const data = {
      title,
      mainArtist,
      subArtist: subArtist.length > 0 ? subArtist : null,
      releaseDate,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    // formData.append("audioFile", audioFile);
    // formData.append("lyricFile", lyricFile);
    if (audioFile) {
      formData.append("audioFile", audioFile);
    }

    if (lyricFile) {
      formData.append("lyricFile", lyricFile);
    }

    try {
      const response = await fetchApiData(
        `/api/admin/update/song/${trackId}`,
        "PATCH",
        formData,
        accessToken,
        null
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Track "${title}" updated successfully.`,
          variant: "success",
        });
        window.location.reload();
      } else {
        alert("Error: " + response.error);
      }
    } catch (error) {
      console.error("Error updating track:", error);
      alert("An error occurred while sending the data.");
    }

    console.log("update track:", data);
  };

  const handleUpdateClick = () => {
    if (!trackTitle.trim() || !mainArtist || !releaseDate || !audioSrc) {
      toast({
        title: "Error",
        description: "Please provide required information before update.",
        variant: "destructive",
      });
      return;
    }
    const trackData = {
      title: trackTitle,
      mainArtist: mainArtist || "",
      subArtist: subArtists,
      audioFile: audioFile,
      releaseDate: releaseDate,
      lyricFile: lyricFile,
    };

    handleUpdate(trackData);
  };

  const handleLyricChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        event.target.value = "";
        // alert("File size should not exceed 10MB");
        toast({
          title: "Error",
          description: "File size should not exceed 10MB",
          variant: "destructive",
        });
        return;
      }
      if (file.type !== "application/json") {
        event.target.value = "";
        alert("Only JSON files are allowed");
        return;
      }
      setLyricFile(file);
    }
  };

  return (
    <Sheet open={!!trackId} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Track Details</SheetTitle>
          <SheetDescription>
            Detailed information about the track.
          </SheetDescription>
        </SheetHeader>
        {trackDetail ? (
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title">
                Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Enter track title"
                className="col-span-3 border-primaryColorBlueHover"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackAlbum">Album</Label>
              <div className="flex col-span-3 ">
                <Image
                  src={trackDetail.album[0]?.albumImages[0]?.image || trackImg}
                  alt={trackDetail.album[0]?.title || "No album"}
                  width={50}
                  height={50}
                  className="rounded-lg w-10 h-10 mr-2"
                />
                <Label
                  htmlFor="trackAlbum"
                  className=" border-primaryColorBlueHover px-2 line-clamp-2"
                >
                  {trackDetail.album[0]?.title || "No album"}
                </Label>
              </div>
            </div>

            {/* Main Artist Selection */}
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
                      ? listArtists.find((a) => a.id === mainArtist)?.name
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
                          {sortedArtists.map((artist) => (
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
                  // onChange={(e) => setReleaseDate(e.target.value)}
                  onChange={(e) => {
                    const [year, month, day] = e.target.value.split("-");
                    const formattedDate = `${month}/${day}/${year} 00:00:00`; // Chuyển sang định dạng MM/dd/yyyy HH:mm:ss
                    setReleaseDate(formattedDate);
                  }}
                />
              </div>
            </div>
            {/* Sub Artists */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subArtists" className="text-left text-textMedium">
                Sub Artists
              </Label>
              <Popover open={openSubArtist} onOpenChange={setOpenSubArtist}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSubArtist}
                    className="w-full justify-between border-darkBlue col-span-3 truncate"
                  >
                    {subArtists.length > 0
                      ? orderedSubArtists
                          .map((artist) => artist?.name)
                          .join(", ")
                      : "This track has no sub artists"}
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
                          {displayArtists.map((artist) => (
                            <CommandItem
                              key={artist?.id}
                              onSelect={() => handleSubArtistSelect(artist!)}
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

            {/* Audio Upload */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="audio" className="text-left text-textMedium">
                Audio<span className="text-red-500">*</span>
              </Label>

              {audioSrc && (
                <div className="col-span-3 flex justify-center items-center my-2">
                  <audio
                    controls
                    ref={audioRef}
                    key={audioSrc}
                    className="h-8 w-full"
                  >
                    <source
                      src={
                        typeof audioSrc === "string" &&
                        audioSrc.startsWith("blob:")
                          ? audioSrc // Trả về nguyên bản nếu là 'blob:'
                          : decrypt(audioSrc) // Giải mã nếu không phải 'blob:'
                      }
                      type="audio/mpeg"
                    />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="audio" className="text-left text-textMedium">
                Edit Audio
              </Label>

              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="col-span-3 border-darkBlue"
              />
            </div>

            {lyric && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="audio" className="text-left text-textMedium">
                  Link Lyric
                </Label>
                <div className="col-span-3 flex justify-center items-center my-2">
                  <button
                    onClick={() =>
                      window.open(lyric, "_blank", "noopener,noreferrer")
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Open Lyric
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lyric" className="text-left text-textMedium">
                Edit Lyric
              </Label>
              <Input
                id="lyric"
                type="file"
                accept="application/json"
                onChange={handleLyricChange}
                className="col-span-3 border-darkBlue"
              />
            </div>

            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label>Plays count</Label>
              <Label className="col-span-3 border-primaryColorBlueHover px-2">{ trackDetail.playCount || "Not found"}</Label>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Likes count</Label>
              <Label className="col-span-3 border-primaryColorBlueHover px-2">{ trackDetail.likeCount || "Not found"}</Label>
            </div> */}
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
            Update Track
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TrackDetailSheet;
