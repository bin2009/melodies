"use client";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { useAppContext as useSongContext } from "@/components/provider/songProvider";
import { useRouter } from 'next/navigation';
import NotFound from "@/app/not-found";
import AlbumList from "@/components/albumList";
import SongList from "@/components/listSong";
import LoadingPage from "@/components/loadingPage";
import PopularArtists from "@/components/popularArtists";
import UserImage from '@/assets/img/placeholderUser.jpg'
import SongImage from '@/assets/img/placeholderSong.jpg'
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCirclePlay } from "react-icons/fa6";
import { getAllArtistsInfo, getMainArtistInfo, getPosterSong } from '@/utils/utils'
import { DataSong, Artist } from "@/types/interfaces";

const SearchPage = ({ params }: { params: { value: string } }) => {
  const router = useRouter();
  const { loading, setLoading } = useAppContext();
  const { setCurrentSong } = useSongContext()
  const [notFound, setNotFound] = useState(false);
  const [topResults, setTopResults] = useState<Artist>()
  const [songTopResults, setSongTopResults] = useState()
  const [artists, setArtists] = useState([])
  const [songs, setSongs] = useState([])
  const [song, setSong] = useState<DataSong>()
  const [albums, setAlbums] = useState([])
  const [activeCategory, setActiveCategory] = useState("All");
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };
  const categories = ["All", "Song", "Playlist", "Artist", "Album"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const result = await fetchApiData(`/api/songs/search`, "GET", null, null, { query: params.value });
      if (result.success) {
        console.log('ok');
        setTopResults(result.data.topResult)
        setSongTopResults(result.data.songTopResult)
        setArtists(result.data.artistData)
        setSongs(result.data.songData)
        setSong(result.data.songData[0])
        setAlbums(result.data.albumData)
      } else {
        console.error("Login error:", result.error);
        setNotFound(true)
      }
      setLoading(false);
    };
    fetchData();
  }, [params.value])

  const isEmptyResults =
    Object.keys(topResults || {}).length === 0 &&
    !artists.length &&
    !songs.length &&
    !albums.length;

  const isEmptyTopResults = topResults ? Object.keys(topResults).length === 0 : true;
  function formatDuration(totalMilliseconds: number) {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const timeParts = [];
    if (hours > 0) {
      timeParts.push(`${hours}:`);
    }
    timeParts.push(`${minutes}:`);
    timeParts.push(`${seconds < 10 ? '0' : ''}${seconds}`);
    return timeParts.join('');
  }
  if (loading) return <LoadingPage />
  if (notFound) return <NotFound />;
  return (
    <div className="mt-[8%] w-full min-h-dvh bg-secondColorBg p-3">
      <div className="bg-[#0E0E0E] w-full p-6 rounded-xl">
        {
          isEmptyResults ? (
            <p className="text-center">Không có kết quả tìm kiếm của &quot;{params.value}&quot;</p>
          ) : (
            <div>
              <div className="mb-7">
                <ul className="flex gap-3">
                  {categories.map((category) => (
                    <li
                      key={category}
                      className={`px-3 py-1 font-semibold text-[0.9rem] rounded-full cursor-pointer ${activeCategory === category
                        ? "bg-white text-black"
                        : "bg-[#2F2F2F] text-white hover:bg-[#333333]"
                        }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-5">
                <div className="w-[30%]">
                  <p className="font-bold text-[1.5rem] mb-2">Kết quả hàng đầu</p>
                  {isEmptyTopResults ? (
                    <div className="relative bg-[#121212]  pt-4 pb-6 px-4 rounded-xl hover:bg-[#2F2F2F] cursor-pointer group">
                      <Image
                        src={song?.album ? getPosterSong(song.album).image : SongImage}
                        alt="Song Poster"
                        width={110}
                        height={110}
                        quality={100}
                        className="object-cover rounded-md mb-3"
                      />
                      <p className="w-[70%] text-3xl font-bold line-clamp-2">
                        {song?.title}
                      </p>
                      <div className="flex items-center gap-2 text-[0.95rem]">
                        <p className="text-primaryColorGray">Bài hát</p>
                        <div className="h-[6px] w-[6px] bg-primaryColorGray rounded-full"></div>
                        <p>{song?.artists ? getMainArtistInfo(song.artists)?.name : ''}</p>
                      </div>
                      <div className="absolute right-3 bottom-7 opacity-0 group-hover:text-primaryColorPink group-hover:opacity-100">
                        <FaCirclePlay className="mx-3 w-[45px] h-[45px]" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative bg-[#121212]  pt-4 pb-6 px-4 rounded-xl hover:bg-[#2F2F2F] cursor-pointer group"
                      onClick={() => router.push(`/artist/${topResults?.id}`)}
                    >
                      <div className="w-[110px] h-[110px] overflow-hidden rounded-full mb-3">
                        <Image
                          src={topResults?.avatar || UserImage}
                          alt="Song Poster"
                          width={110}
                          height={110}
                          quality={100}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="w-[70%] text-3xl font-bold line-clamp-2 group-hover:underline">
                        {topResults?.name}
                      </p>
                      <p className="text-primaryColorGray mt-1">Nghệ sĩ</p>
                    </div>
                  )}

                </div>
                <div className="w-[60%]">
                  <p className="font-bold text-[1.5rem] mb-2">Bài hát</p>
                  <div className="flex flex-col gap-1 w-full">
                    {(isEmptyTopResults ? songs : songTopResults)?.slice(0, 4).map((song: DataSong, index) => {
                      const poster = getPosterSong(song.album)
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center cursor-pointer hover:bg-[#2F2F2F] py-2 px-3 rounded-md"
                          onClick={() => setCurrentSong(song)}
                        >
                          <div className="relative group flex">
                            <Image
                              src={poster.image}
                              alt="Song Poster"
                              width={45}
                              height={45}
                              quality={100}
                              className="object-cover rounded-md"
                            />
                            <div className="ml-3">
                              <p
                                className="font-bold hover:underline"
                                onClick={() => router.push(`/song/${song.id}`)}
                              >{song?.title}</p>
                              <div className="flex flex-wrap text-[0.9rem]">
                                {song?.artists ? (
                                  getAllArtistsInfo(song.artists).map((artist, index, array) => (
                                    <span key={artist.id} className="flex items-center">
                                      <span
                                        className="cursor-pointer hover:underline"
                                        onClick={() => router.push(`/artist/${artist.id}`)}
                                      >
                                        {artist.name}
                                      </span>
                                      {index < array.length - 1 && <span>,&nbsp;</span>}
                                    </span>
                                  ))
                                ) : (
                                  <p>Unknown Artist</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-primaryColorGray font-thin text-[0.9rem]">
                              {formatDuration(song.duration)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <SongList maintitle="Songs" data={songs} />
              </div>
              <div className="mt-6">
                <PopularArtists maintitle='Artists' data={artists} />
              </div>
              <div className="mt-6">
                <AlbumList maintitle='Albums' data={albums} />
              </div>
            </div>

          )
        }

      </div>
    </div>
  );
};

export default SearchPage;
