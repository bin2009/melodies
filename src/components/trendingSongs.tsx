"use client";
import Image from "next/image";
import { HeartIcon } from "@radix-ui/react-icons";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { formatTime, getMainArtistName, getPosterSong } from "@/utils/utils";
import { DataSong } from "@/types/interfaces";
import { useAppContext } from "@/components/provider/songProvider";

interface SongListProps {
  maintitle?: string;
  subtitle?: string;
  data?: Array<DataSong>;
}

const TrendingSongs: React.FC<SongListProps> = ({ maintitle, subtitle, data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { setCurrentSong, setWaitingList } = useAppContext();

  const options = { year: 'numeric' as 'numeric' | '2-digit', month: 'short' as 'numeric' | '2-digit', day: 'numeric' as 'numeric' | '2-digit' };

  return (
    <div className="w-full mt-2">
      <h1 className="text-white text-h1">
        {maintitle} <span className="text-primaryColorPink">{subtitle}</span>
      </h1>
      <div className="flex flex-col justify-center items-center">
        <table className="max-w-full text-white border-separate border-spacing-y-3 ">
          <thead className="w-full max-h-[32px]">
            <tr>
              <th className="w-[3%] pl-4"></th>
              <th className="w-[4%] pl-4"></th>
              <th className="w-[30%] pl-4"></th>
              <th className="w-[15%] text-textMedium pl-4">Release Date</th>
              <th className="w-[33%] text-textMedium pl-4">Album</th>
              <th className="w-[15%] text-textMedium ">Time</th>
            </tr>
          </thead>
          <tbody className="">
            {data?.slice(0, 10)?.map((song, index) => {
              const nameArtist = getMainArtistName(song.artists);
              const poster = getPosterSong(song.album).image;
              const nameAlbum = getPosterSong(song.album).title;
              return (
                <tr
                  key={index}
                  className="bg-secondColorBg  cursor-pointer hover:bg-gray-700"
                  onClick={() => {
                    setCurrentSong(song);
                    if (data) {
                      setWaitingList(data);
                    }
                  }}
                >
                  <td className="pl-4 pr-8 text-h4 rounded-tl-lg rounded-bl-lg">
                    #{index + 1}
                  </td>
                  <td className="">
                    <Image
                      src={poster}
                      alt="song"
                      width={60}
                      height={60}
                      className="rounded-lg"
                    />
                  </td>
                  <td className="pl-4">
                    <h3 className="text-h4 mb-1 line-clamp-2 hover:underline">
                      {song.title}
                    </h3>
                    <p className="text-textSmall line-clamp-1 hover:underline">
                      {nameArtist}
                    </p>
                  </td>
                  <td className="text-textMedium pl-4 text-center">
                    {new Date(song?.releaseDate).toLocaleDateString('en-US', options)}
                  </td>
                  {/* <td className="text-textMedium pl-4 line-clamp-2 text-center align-middle">
                    {nameAlbum}
                  </td> */}
                  <td className="text-textMedium pl-4 line-clamp-2 text-center align-middle table-cell">
                    {nameAlbum}
                  </td>

                  <td className="text-center pl-4 rounded-tr-lg rounded-br-lg align-middle">
                    <div className="flex gap-2 items-center justify-center">
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
                      <p className="text-textMedium">
                        {formatTime(song.duration)}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button className="h-[40px] w-[120px] mt-1 bg-secondColorBg text-white rounded-sm flex items-center justify-center gap-2">
          <PlusIcon className="w-5 h-5" />
          View All
        </button>
      </div>
    </div>
  );
};

export default TrendingSongs;
