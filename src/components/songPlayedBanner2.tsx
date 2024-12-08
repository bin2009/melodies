"use client";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/app/AppProvider";
import Image from "next/image";
import posterImg from "@/assets/img/placeholderSong.jpg";
import { fetchApiData } from "@/app/api/appService";
import { DataSong } from "@/types/interfaces";
import { getMainArtistId } from "@/utils/utils";
import "./scss/musicPlayer.scss";

import {
  FaCirclePlay,
  FaCirclePause,
  FaForward,
  FaBackward,
  FaRepeat,
  FaListCheck,
} from "react-icons/fa6";
import {
  BsFilePlayFill,
  BsSkipEndFill,
  BsFillSkipStartFill,
} from "react-icons/bs";
import {
  PiSpeakerHighFill,
  PiSpeakerXFill,
  PiSpeakerLowFill,
} from "react-icons/pi";
import { MdLyrics } from "react-icons/md";
import { RiExpandDiagonalLine } from "react-icons/ri";

import { TbSwitch3 } from "react-icons/tb";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTime, getMainArtistName, getPosterSong } from "@/utils/utils";
import WaveSurfer from "wavesurfer.js";
import { decrypt } from "@/app/decode";
import LoadingPage from "@/components/loadingPage";

function SongPlayedBanner2({ currentSong, playlist }: { currentSong: object, playlist: string[] }) {
  const [notFound, setNotFound] = useState(false);
  const [dominantColor, setDominantColor] = useState<string>();
  const [dataSong, setDataSong] = useState<DataSong>();
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const { accessToken, loading, setLoading } = useAppContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // useEffect(() => {
  //   if (currentSongId) {
  //     console.log("currentSongId:", currentSongId);
  //     console.log("playlist:", playlist);

  //     const fetchData = async () => {
  //       setLoading(true);
  //       setDataSong(song);
  //       // Xử lý màu sắc
  //       const imageUrl =
  //         typeof getPosterSong(song.album).image === "string"
  //           ? getPosterSong(song.album).image
  //           : "";
  //       try {
  //         const responses = await fetch(
  //           `/api/get-dominant-color?imageUrl=${encodeURIComponent(imageUrl)}`
  //         );
  //         const data = await responses.json();
  //         if (responses.ok) setDominantColor(data.dominantColor);
  //       } catch (error) {
  //         console.error("Error fetching dominant color:", error);
  //       }
  //       setLoading(false);
  //     };

  //     fetchData();
  //   }
  // }, [ accessToken, setLoading]);

  useEffect(() => {
    if (currentSong && currentSong.song) {
      const audioUrl = currentSong.song.filePathAudio
        ? decrypt(currentSong.song.filePathAudio)
        : ""
        // : "https://audiomelodies.nyc3.cdn.digitaloceanspaces.com/PBL6/AUDIO/OLD/Chillies/VaTheLaHet/VaTheLaHet.m4a";

        console.log("song: ", audioUrl)

      setIsPlaying(currentSong.song.isPlaying)
      setStartTime(currentSong.song.currentTime)
      if (audioRef.current) {
        audioRef.current.pause(); // Dừng bài hát hiện tại
        audioRef.current.src = audioUrl; // Cập nhật src
        audioRef.current.load(); // Load lại audio
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Autoplay failed:", error));
      } else {
        audioRef.current = new Audio(audioUrl);
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Autoplay failed:", error));
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      const audioElement = audioRef.current;
      if (audioElement.readyState >= 1) {
        setEndTime(audioElement.duration);
      }

      const handleMetadataLoaded = () => {
        const duration = audioElement.duration;
        setEndTime(duration);

        audioElement
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Autoplay failed:", error);
          });
      };

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          setStartTime(currentTime);
        }
      };

      const handleAudioEnded = () => {
        setIsPlaying(false);
        setStartTime(0);
      };

      audioElement.addEventListener("loadedmetadata", handleMetadataLoaded);
      audioElement.addEventListener("timeupdate", handleTimeUpdate);
      audioElement.addEventListener("ended", handleAudioEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener(
            "loadedmetadata",
            handleMetadataLoaded
          );
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.removeEventListener("ended", handleAudioEnded);
        }
      };
    }
  }, [audioRef.current]); // Ensure the effect runs when the audioRef.current changes

  const handleRandomPlay = () => {
    if (playlist.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex);
      setCurrentSongId(playlist[randomIndex]);
    }
  };

  const handlePreviousSong = () => {
    if (playlist.length > 0) {
      const previousIndex =
        (currentIndex - 1 + playlist.length) % playlist.length;
      setCurrentSongId(playlist[previousIndex]);
    }
  };

  const handleNextSong = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentSongId(playlist[nextIndex]);
    }
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
    if (audioRef.current) {
      audioRef.current.loop = !audioRef.current.loop;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      const handleAudioEnded = () => {
        if (isRepeat) {
          audioRef.current?.play();
        } else {
          handleNextSong();
        }
      };

      audioRef.current.addEventListener("ended", handleAudioEnded);

      return () => {
        audioRef.current?.removeEventListener("ended", handleAudioEnded);
      };
    }
  }, [isRepeat, handleNextSong]);

  const progressWidth = (startTime / endTime) * 100 || 0;

  const handleClickOnProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * 100;
      const newTime = (newProgress / 100) * endTime;

      audioRef.current.currentTime = newTime;
      setStartTime(newTime);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      const audioElement = audioRef.current;
      audioElement.currentTime += 5;
      setStartTime(audioElement.currentTime);
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      const audioElement = audioRef.current;
      const newTime = Math.max(0, audioElement.currentTime - 5); // Đảm bảo không dưới 0
      audioElement.currentTime = newTime;
      setStartTime(newTime);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <TooltipProvider>
      <div className="w-full bg-secondColorBg rounded-lg">
        <div
          className="m-3 rounded-lg border-2 border-primaryColorBg bg-gradient-to-b to bg-primaryColorBg overflow-auto"
          style={{
            background: `linear-gradient(to bottom, ${dominantColor} 20%, rgba(0, 0, 0, 1) 80%)`,
          }}
        >
          {/* Nội dung của banner */}
          <div className=" w-full h-[22vh] flex flex-col justify-end gap-6 rounded-t-lg bg-gradient-to-b from-transparent to-black/30">
            {/* Header */}
            {/* Content albums */}
            <div className="flex items-start gap-8">
              <div className="shadow-[0_4px_60px_rgba(0,0,0,0.5)] rounded-md">
                <Image
                  src={
                    currentSong.song?.album
                      ? getPosterSong(currentSong.song.album).image
                      : posterImg
                  }
                  alt="Album Cover"
                  width={160}
                  height={160}
                  priority
                  className="rounded-tl-md round-bl-md w-40 h-40"
                />
              </div>
              <div className="h-full flex flex-col justify-between">
                <div className="flex gap-1 flex-col">
                  {/* <h3>Song</h3> */}
                  <h1 className="mt-3 text-2xl font-bold">{currentSong.song?.title}</h1>
                  <div className="flex items-center space-x-2 text-textMedium ">
                    <p className="cursor-pointer hover:underline">
                      {currentSong.song?.artists
                        ? getMainArtistName(currentSong.song.artists)
                        : "Unknown Artist"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center mb-4">
                  <div className="flex items-center mb-1 text-primaryColorGray cursor-pointer">
                    <Tooltip>
                      <TooltipTrigger>
                        <TbSwitch3
                          className="mx-3 w-[24px] h-[24px] hover:text-primaryColorPink"
                          onClick={handleRandomPlay}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Turn on random play</p>
                      </TooltipContent>
                    </Tooltip>
                    <BsFillSkipStartFill
                      className="mx-3 w-[25px] h-[25px] hover:text-primaryColorPink"
                      onClick={handlePreviousSong}
                    />
                    <FaBackward
                      className="mx-3 w-[20px] h-[20px]  hover:text-primaryColorPink"
                      onClick={handleSkipBackward}
                    />
                    {isPlaying ? (
                      <FaCirclePause
                        className="mx-3 w-[32px] h-[32px]  hover:text-primaryColorPink"
                        onClick={handlePlayPause}
                      />
                    ) : (
                      <FaCirclePlay
                        className="mx-3 w-[32px] h-[32px]  hover:text-primaryColorPink"
                        onClick={handlePlayPause}
                      />
                    )}
                    <FaForward
                      className="mx-3 w-[20px] h-[20px] hover:text-primaryColorPink"
                      onClick={handleSkipForward}
                    />
                    <BsSkipEndFill
                      className="mx-3 w-[25px] h-[25px] hover:text-primaryColorPink"
                      onClick={handleNextSong}
                    />
                    <Tooltip>
                      <TooltipTrigger className="relative">
                        <FaRepeat
                          className={`mx-3 w-[20px] h-[20px] hover:text-primaryColorPink ${
                            isRepeat ? "text-primaryColorPink" : "text-white"
                          }`}
                          onClick={handleRepeat}
                        />
                        {isRepeat && (
                          <div className="absolute left-2 -bottom-2 mx-3 w-[5px] h-[5px] bg-primaryColorPink rounded-full"></div>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {isRepeat ? "Turn off repeat" : "Turn on repeat"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-full flex items-center">
                    <p className="mx-2 text-[0.9rem]">
                      {formatTime(startTime * 1000)}
                    </p>
                    <div
                      className="relative group hover:cursor-pointer"
                      onClick={handleClickOnProgress}
                    >
                      <div
                        className="absolute -top-[270%] left-0 w-full h-full opacity-0 group-hover:opacity-100 -z-10"
                        id="waveform"
                      ></div>
                      <div className="w-[15vw] bg-[#4D4D4D] h-1 rounded-md "></div>
                      <div
                        className="absolute bg-white top-0 w-full h-1 rounded-md"
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                      <div
                        className="absolute -top-[100%] left-[50%] w-3 h-3 bg-white rounded-full transform -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ left: `calc(${progressWidth}%)` }}
                      ></div>
                    </div>
                    <p className="mx-2 text-[0.9rem]">
                      {formatTime(endTime * 1000)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default SongPlayedBanner2;
