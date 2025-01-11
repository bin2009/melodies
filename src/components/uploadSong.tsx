"use client";
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
import { FaUpload } from "react-icons/fa6";
import SongImage from "@/assets/img/placeholderSong.jpg";
import Image from "next/image";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/interfaces";

const UploadSong = () => {
  const { accessToken, role } = useAppContext();
  const [trackTitle, setTrackTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [lyricFile, setLyricFile] = useState<File | null>(null);
  const [image, setImage] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (accessToken) {
      const fetchData = async () => {
        const result = await fetchApiData(
          `/api/user`,
          "GET",
          null,
          accessToken ?? null
        );
        if (result.success) {
          setUser(result.data.user);
          localStorage.setItem("avatar", result.data.user.image);
        } else {
          console.error("Login error:", result.error);
        }
      };

      fetchData();
    }
  }, [accessToken]);

  const handleUploadClick = () => { 
    toast({
      title: "Error",
      description: "Please register a Premium package to use this feature.",
      variant: "destructive",
    });
    setTimeout(() => {
      router.replace("/premium");
    }, 1500);
    return;
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];

    if (!file) {
      return;
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validImageTypes.includes(file.type)) {
      alert("Invalid file type. Please select a JPG, PNG, or GIF image.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      alert("File size exceeds 1MB. Please choose a smaller file.");
      return;
    }

    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", JSON.stringify(trackTitle));
    formData.append("releaseDate", JSON.stringify(releaseDate));
    if (audioFile) {
      formData.append("audioFile", audioFile);
    }
    if (lyricFile) {
      formData.append("lyricFile", lyricFile);
    }
    if (selectedFile) {
      formData.append("imageFile", selectedFile);
    }
    console.log(formData);
    const result = await fetchApiData(
      `/api/user/uploadSong`,
      "POST",
      formData,
      accessToken
    );
    if (result.success) {
      console.log(result.data);
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        event.target.value = "";
        setAudioSrc(null);
        alert("File size should not exceed 30MB");
        return;
      }
      setAudioFile(file);

      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }

      const url = URL.createObjectURL(file);
      setAudioSrc(url);
    }
  };

  const handleLyricChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        event.target.value = "";
        alert("File size should not exceed 1MB");
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
    <>
      {(!role || user?.accountType !== "PREMIUM") ? (
        <button className="flex" onClick={handleUploadClick}>
          <FaUpload className="w-[20px] h-[20px] mr-3" />
          Upload Song
        </button>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex">
              <FaUpload className="w-[20px] h-[20px] mr-3" />
              Upload Song
            </button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-primaryColorPink">
                Add New Track
              </SheetTitle>
              <SheetDescription>
                Enter details to add a new track.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4 items-start">
              <div className="flex flex-col items-center gap-5">
                <Image
                  src={image || SongImage}
                  alt="Avatar"
                  width={100}
                  height={100}
                  quality={100}
                  className="object rounded-md w-[100px] h-[100px]"
                />
                <div className="space-y-2 flex flex-col items-center">
                  <button
                    onClick={handleButtonClick}
                    className="py-2 px-3 bg-white text-black rounded-lg font-semibold text-[0.9rem]"
                  >
                    Change avatar
                  </button>
                  <input
                    ref={fileInputRef}
                    id="avatar-input"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-[0.8rem]">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="trackTitle"
                  className="text-left text-textMedium"
                >
                  Title
                </Label>
                <Input
                  id="trackTitle"
                  value={trackTitle}
                  maxLength={150}

                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Enter track title"
                  className="col-span-3 border-darkBlue"
                  required
                />
              </div>

              {/* Release Date */}

              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="releaseDate"
                  className="text-left text-textMedium"
                >
                  Release Date
                </label>
                <div className="col-span-3">
                  <input
                    id="releaseDate"
                    type="date"
                    maxLength={150}
                    className="calendar-icon w-full border-primaryColorBlue border p-2 rounded-md bg-slate-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColorBlue"
                    onChange={(e) => setReleaseDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="audio" className="text-left text-textMedium">
                  Audio
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
              <SheetClose asChild>
                <Button
                  onClick={handleSave}
                  type="submit"
                  className="text-textMedium p-3 bg-primaryColorPink flex items-center gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
                >
                  Save Track
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
// };

export default UploadSong;
