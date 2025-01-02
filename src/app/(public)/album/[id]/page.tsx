"use client";
import Image, { StaticImageData } from "next/image";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/app/AppProvider";
import { useAppContext as useSongContext } from "@/components/provider/songProvider";
import { fetchApiData } from "@/app/api/appService";
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import { IoPlayCircleOutline } from "react-icons/io5";
import { TfiMoreAlt } from "react-icons/tfi";
import { IoIosMore } from "react-icons/io";
import { RiPlayListAddLine } from "react-icons/ri";
import AlbumList from "@/components/albumList";
import LoadingPage from "@/components/loadingPage";
import NotFound from "@/app/not-found";
import { DataAlbum } from "@/types/interfaces";
import { formatTime, getMainArtistInfo, getPoster } from "@/utils/utils";
import { useScrollArea } from "@/components/provider/scrollProvider";
import { useRouter } from "next/navigation";

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { loading, setLoading } = useAppContext();
  const { scrollAreaRef } = useScrollArea();
  const { showSidebarRight, addListToWaitingList, setCurrentSong, setWaitingList } = useSongContext()
  const [dataAlbum, setDataAlbum] = useState<DataAlbum>()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dominantColor, setDominantColor] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenuMore, setShowMenuMore] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef?.current) {
        const scrollTop = scrollAreaRef.current.scrollTop;
        console.log("scrollTop", scrollTop);
        setIsScrolled(scrollTop > 180);
      }
    };
    if (scrollAreaRef?.current) {
      scrollAreaRef.current.addEventListener("scroll", handleScroll);
      return () => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [scrollAreaRef]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchApiData(`/api/album/${params.id}`, "GET");
      if (result.success) {
        setDataAlbum(result.data.album)
        const imageUrl = typeof getPoster(result.data.album) === "string"
          ? getPoster(result.data.album)
          : `${process.env.NEXT_PUBLIC_FE}${(getPoster(result.data.album) as StaticImageData).src}`;
        console.log(imageUrl);

        try {
          const response = await fetch(
            `/api/get-dominant-color?imageUrl=${encodeURIComponent(imageUrl as string)}`
          );
          console.log("API response:", response);
          const data = await response.json();
          if (response.ok) {
            console.log("Dominant color:", data.dominantColor);
            setDominantColor(data.dominantColor);
          } else {
            console.error("Error fetching dominant color:", data.error);
          }
        } catch (error) {
          console.error("Error fetching dominant color:", error);
        }
      } else {
        console.error("Login error:", result.error);
        setNotFound(true)
      }
      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  function formatDuration(totalMilliseconds: number) {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const timeParts = [];
    if (hours > 0) {
      timeParts.push(`${hours}h`);
    }
    timeParts.push(`${minutes} min`);
    timeParts.push(`${seconds} sec`);
    return timeParts.join(' ');
  }

  if (loading) return <LoadingPage />
  if (notFound) return <NotFound />;
  return (
    <div className="w-full  bg-secondColorBg">
      <div
        className="m-3 rounded-lg border-2 border-primaryColorBg bg-gradient-to-b to bg-primaryColorBg overflow-auto"
        style={{
          background: `linear-gradient(to bottom, ${dominantColor} 20%, rgba(0, 0, 0, 1) 80%)`,
        }}
      >
        {/* Banner album */}
        <div className=" w-full h-[50vh] p-5 flex flex-col justify-end gap-6 rounded-t-lg bg-gradient-to-b from-transparent to-black/30">
          {/* Header */}
          {/* Content albums */}
          <div className="flex items-end gap-8">
            <div className="shadow-[0_4px_60px_rgba(0,0,0,0.5)] rounded-md ">
              {dataAlbum && (
                <Image
                  src={getPoster(dataAlbum)}
                  alt="Album Cover"
                  width={220}
                  height={220}
                  priority
                  className="rounded-md"
                />
              )}
            </div>
            <div className="flex gap-4 flex-col">
              <h3 className="uppercase">{dataAlbum?.albumType}</h3>
              <h1 className="text-t1 text-[58px] ">{dataAlbum?.title}</h1>
              <div className="flex items-center space-x-2 text-h4 font-semibold">
                <p>{dataAlbum?.artistMain.name}</p>
                <span className="text-gray-300">•</span>
                <p className="text-gray-300">{dataAlbum?.releaseDate ? new Date(dataAlbum.releaseDate).getFullYear() : "Unknown"}</p>
                <span className="text-gray-300">•</span>
                <p className="text-gray-300">{dataAlbum?.songNumber ?? 0} {(dataAlbum?.songNumber ?? 0) > 1 ? 'songs' : 'song'}</p>
                <span className="text-gray-300">•</span>
                <p className="text-gray-300">{formatDuration(dataAlbum?.totalDuration ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 fixed top-24 pl-8 font-bold text-2xl py-4 transition-transform duration-300
                        ${isScrolled ? "translate-y-0 z-10" : "-translate-y-full opacity-0"} ${showSidebarRight ? 'w-[61%]' : 'w-[81%]'}`}
          style={{
            backgroundColor: isScrolled ? "#1F1F1F" : "transparent",
          }}
        >
          <IoPlayCircleOutline
            className="w-12 h-12 text-white cursor-pointer"
            onClick={() => { if (dataAlbum?.songs) { setCurrentSong(dataAlbum?.songs[0]); setWaitingList(dataAlbum?.songs); } }}
          />
          {dataAlbum?.title}
        </div>

        {/* Song lists */}
        <div className="m-3 flex flex-col">
          <div className="relative flex gap-5 items-center">
            <IoPlayCircleOutline className="ml-3 mt-1 w-16 h-16 text-primaryColorPink"
              onClick={() => { if (dataAlbum?.songs) { setCurrentSong(dataAlbum?.songs[0]); setWaitingList(dataAlbum?.songs); } }}
            />
            <button className=" text-primaryColorPink" onClick={() => setShowMenuMore(!showMenuMore)}>
              <TfiMoreAlt className="w-5 h-5 shadow-[0_4px_60px_rgba(0,0,0,0.3)]" />
            </button>
            {
              showMenuMore && (
                <div className="absolute top-14 left-20 bg-[#1F1F1F] p-2 rounded-md">
                  <ul className="">
                    <li
                      className="flex gap-2 pl-1 pr-3 py-2 items-center cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md"
                      onClick={() => { if (dataAlbum?.songs) { addListToWaitingList(dataAlbum.songs); setShowMenuMore(false); } }}
                    ><RiPlayListAddLine /> Add to waiting list</li>
                  </ul>
                </div>
              )
            }
          </div>
          <table className="max-w-full text-white border-separate border-spacing-y-3 ">
            <thead className="w-full max-h-[32px]">
              <tr className="text-primaryColorGray text-[0.9rem]">
                <th className="w-[4%] pl-4 text-start">#</th>
                <th className="w-[4%] pl-4"></th>
                <th className="w-[70%] pl-4 text-start">Tiêu đề</th>
                <th className="w-[10%] text-textMedium ">Time</th>
              </tr>
            </thead>
            <tbody>
              {dataAlbum?.songs.map((song, index) => (
                <tr
                  key={index}
                  className="bg-secondColorBg cursor-pointer hover:bg-gray-700"
                >
                  <td className="pl-4 pr-8 text-h4 rounded-tl-lg rounded-bl-lg">
                    #{index + 1}
                  </td>
                  <td className="py-1">
                    <Image
                      src={getPoster(dataAlbum)}
                      alt="song"
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                  </td>
                  <td className="pl-4">
                    <h3 
                    className="text-h4 mb-1 hover:underline"
                    onClick={()=> router.push(`/song/${song.id}`)}
                    >
                      {song.title}
                    </h3>
                    <p className="text-textSmall hover:underline">
                      {getMainArtistInfo(song.artists)?.name}
                    </p>
                  </td>
                  <td className="text-center pl-4 rounded-tr-lg rounded-br-lg align-middle">
                    <div className="flex gap-3 items-center justify-center">
                      <div
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {hoveredIndex === index ? (
                          <HeartFilledIcon className="text-primaryColorPink w-5 h-5 cursor-pointer" />
                        ) : (
                          <HeartIcon className="text-primaryColorPink w-5 h-5 cursor-pointer" />
                        )}
                      </div>
                      <p className="text-textMedium">{formatTime(song.duration)}</p>
                      <button className="hover:scale-110">
                        <IoIosMore className="w-5 h-5 shadow-[0_4px_60px_rgba(0,0,0,0.3)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mx-5 mt-10 mb-20">
          <AlbumList maintitle="Other albums by " subtitle={dataAlbum?.artistMain.name} data={dataAlbum?.albumAnother} />
        </div>
      </div>
    </div>
  );
}

export default Page;
