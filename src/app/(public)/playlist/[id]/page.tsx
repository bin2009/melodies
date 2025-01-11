'use client'
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/AppProvider";
import { useAppContext as useSongContext } from "@/components/provider/songProvider";
import PlaylistBanner from "@/components/playlistBanner"
import { IoSearch } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { TfiMoreAlt } from "react-icons/tfi";
import Image from "next/image";
import { fetchApiData } from "@/app/api/appService";
import LoadingPage from "@/components/loadingPage";
import { DataPlaylist, DataSong } from "@/types/interfaces";
import { formatTime, getMainArtistInfo, getPosterSong } from "@/utils/utils";
import { RiPlayListAddLine } from "react-icons/ri";
import { MdEdit, MdDelete } from "react-icons/md";
import UpdatePlaylist from "@/components/popup/updatePlaylist";
import ConfirmDeletePlaylist from "@/components/popup/confirmDeletePlaylist";
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import ConfirmDeleteSongOnPlaylist from "@/components/popup/confirmDeleteSongOnPlaylist";
import EditSongUpload from "@/components/editSongUpload";

const Page = ({ params }: { params: { id: string } }) => {
    const { toast } = useToast()
    const { accessToken, loading, setLoading } = useAppContext()
    const { addListToWaitingList, setCurrentSong, setWaitingList, addToWaitingList } = useSongContext();
    const [playlist, setPlaylist] = useState<DataPlaylist>()
    const [songsOfPlaylist, setSongOfPlaylist] = useState<DataSong[]>([])
    const [showMenuMore, setShowMenuMore] = useState<boolean>(false)
    const [activeMenuSong, setActiveMenuSong] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [dominantColor, setDominantColor] = useState<string>();
    const [filteredSongs, setFilteredSongs] = useState<DataSong[]>([]);
    const [isUpdate, setIsUpdate] = useState<boolean>(false)
    const [isDelete, setIsDelete] = useState<boolean>(false)
    const [isDeleteSong, setIsDeleteSong] = useState<boolean>(false)
    const [songSelected, setSongSelected] = useState<DataSong>()

    useEffect(() => {
        const fetchSong = async () => {
            setLoading(true);
            try {
                const responses = await Promise.all([
                    fetchApiData(`/api/user/playlist/detail/${params.id}`, "GET", null, accessToken),
                    fetchApiData(`/api/user/playlist/detail/${params.id}/songs`, "GET", null, accessToken),
                ]);
                if (responses[0].success) {
                    setPlaylist(responses[0].data.playlist)
                    const imageUrl = responses[0].data.playlist.image;
                    if (imageUrl) {
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
                        setDominantColor('#595959');
                    }
                }
                if (responses[1].success) {
                    setSongOfPlaylist(responses[1].data.songsOfPlaylist)
                }
            } catch (error) {
                console.error("Error fetching songs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSong();
    }, [params.id]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (searchTerm === "") {
                setFilteredSongs([]);
            } else {
                const results = await fetchApiData(`/api/songs/search`, "GET", null, null, { query: searchTerm, page: 1 });
                if (results.success) {
                    setFilteredSongs(results.data.songData)
                }
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
    };

    const handleAddSong = async (idSong: string) => {
        const payload = {
            playlistId: params.id,
            songId: idSong
        }

        const result = await fetchApiData(`/api/user/playlist/addSong`, "POST", JSON.stringify(payload), accessToken);
        if (result.success) {
            setSongOfPlaylist((prev) => [result.data.newSong, ...prev])
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: result.error,
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    }

    const toggleMenu = (id: string) => {
        setActiveMenuSong(activeMenuSong === id ? null : id);
    }

    if (loading) return <LoadingPage />
    return (
        <div className="w-full  bg-secondColorBg">
            <div
                className="m-3 rounded-lg border-2 border-primaryColorBg bg-gradient-to-b to bg-primaryColorBg overflow-auto"
                style={{
                    background: `linear-gradient(to bottom, ${dominantColor} 20%, rgba(0, 0, 0, 1) 80%)`,
                }}
            >
                <PlaylistBanner data={playlist} setIsUpdate={setIsUpdate} />
                <div className="m-3 flex flex-col pl-5">
                    <div className="flex gap-5 items-center relative">
                        <IoPlayCircleOutline className="mt-1 w-16 h-16 text-primaryColorPink" />
                        <button className=" text-primaryColorPink" onClick={() => setShowMenuMore(!showMenuMore)}>
                            <TfiMoreAlt className="w-5 h-5 shadow-[0_4px_60px_rgba(0,0,0,0.3)]" />
                        </button>
                        {
                            showMenuMore && (
                                <div className="absolute top-14 left-20 bg-[#1F1F1F] p-2 rounded-md">
                                    <ul className="">
                                        <li
                                            className="flex gap-2 pl-1 pr-3 py-2 items-center cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md"
                                            onClick={() => addListToWaitingList(songsOfPlaylist)}
                                        ><RiPlayListAddLine /> Add to waiting list</li>
                                        <li
                                            className="flex gap-2 pl-1 pr-3 py-2 items-center cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md "
                                            onClick={() => { setIsUpdate(true); setShowMenuMore(false) }}
                                        ><MdEdit /> Edit detail playlist</li>
                                        <li
                                            className="flex gap-2 pl-1 pr-3 py-2 items-center cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md"
                                            onClick={() => { setIsDelete(true); setShowMenuMore(false) }}
                                        ><MdDelete /> Delete playlist</li>
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
                                <th className="w-[35%] pl-4 text-start">Tiêu đề</th>
                                <th className="w-[30%] pl-4 text-start">Album</th>
                                <th className="w-[8%] pl-4 text-start ">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songsOfPlaylist?.map((song, index) => (
                                <tr
                                    key={index}
                                    className="bg-secondColorBg cursor-pointer hover:bg-gray-700"
                                    onClick={() => { setCurrentSong(song); setWaitingList(songsOfPlaylist); }}
                                >
                                    <td className="pl-4 pr-8 text-h4 rounded-tl-lg rounded-bl-lg">
                                        #{index + 1}
                                    </td>
                                    <td className="py-1">
                                        <Image
                                            src={playlist?.privacy && song?.image ? song.image : getPosterSong(song.album).image}
                                            alt="song"
                                            width={50}
                                            height={50}
                                            className="w-[50px] h-[50px] rounded-lg"
                                        />
                                    </td>
                                    <td className="pl-4">
                                        <h3 className="text-h4 mb-1 hover:underline">
                                            {song.title}
                                        </h3>
                                        <p className="text-textSmall hover:underline">
                                            {getMainArtistInfo(song.artists)?.name}
                                        </p>
                                    </td>
                                    <td className="pl-4">
                                        <p className="text-[0.9rem] font-semibold hover:underline">
                                            {getPosterSong(song.album).title}
                                        </p>
                                    </td>
                                    <td className="rounded-tr-lg rounded-br-lg text-start">
                                        <div className="relative flex gap-3 items-center justify-center">
                                            <p className="text-textMedium">{formatTime(song.duration)}</p>
                                            <button className="hover:scale-110">
                                                <TfiMoreAlt
                                                    onClick={() => toggleMenu(song.id)}
                                                    className="w-4 h-4 shadow-[0_4px_60px_rgba(0,0,0,0.3)]" />
                                            </button>
                                            {
                                                activeMenuSong === song.id && (
                                                    <div className="absolute top-5 w-44 right-8 bg-[#1F1F1F] p-2 rounded-md">
                                                        <ul className="">
                                                            <li
                                                                className="flex gap-2 pl-1 pr-3 py-2 items-center cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md"
                                                                onClick={() => addToWaitingList(song)}
                                                            ><RiPlayListAddLine /> Add to waiting list</li>
                                                            <li className="pl-1 pr-3 py-2 cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md">
                                                                <EditSongUpload idSong={song.id} />
                                                            </li>
                                                            <li
                                                                className="flex gap-2 pl-1 pr-3 py-2 items-center cursor-pointer hover:bg-slate-500 transition-all duration-300 text-[0.9rem] rounded-md"
                                                                onClick={() => { setIsDeleteSong(true); setActiveMenuSong(null); setSongSelected(song) }}
                                                            ><MdDelete /> Delete song</li>
                                                        </ul>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="w-full h-[0.125rem] bg-gray-500 my-5">

                    </div>
                    <div>
                        <p className="font-bold text-2xl mb-3">Let&apos;s find content for your playlist</p>
                        <div className="flex items-center bg-[#2C2C2C] w-[35%] p-2 gap-2 rounded-md">
                            <IoSearch className="text-[1.2rem]" />
                            <input type="text" placeholder="Find songs"
                                className="focus:outline-none placeholder:text-[0.9rem] placeholder:text-primaryColorGray text-primaryColorGray text-[0.9rem] bg-transparent w-full"
                                value={searchTerm}
                                onChange={handleSearch}
                        maxLength={150}
                            />
                        </div>
                    </div>
                    <table className="max-w-full text-white border-separate border-spacing-y-3 ">
                        <thead className="w-full max-h-[32px]">
                            <tr>
                                <th className="w-[35%] pl-4"></th>
                                <th className="w-[40%] pl-4"></th>
                                <th className="w-[15%] pl-4"></th>
                            </tr>
                        </thead>
                        <tbody className="mt-4">
                            {filteredSongs.length > 0 && (
                                filteredSongs.map((song, index) => (
                                    <tr key={index}>
                                        <td className="relative group flex" >
                                            <Image
                                                src={getPosterSong(song.album).image}
                                                alt="Song Poster"
                                                width={48}
                                                height={48}
                                                quality={100}
                                                className="object-cover rounded-md"
                                            />
                                            <div className="ml-3">
                                                <p className="font-bold text-white">{song.title}</p>
                                                <p className="font-thin text-primaryColorGray text-[0.9rem]">
                                                    {getMainArtistInfo(song.artists)?.name}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="font-thin text-primaryColorGray text-[0.9rem]">
                                                {getPosterSong(song.album).title}
                                            </p>
                                        </td>
                                        <td>
                                            <button
                                                className="px-4 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300"
                                                onClick={() => handleAddSong(song.id)}
                                            >Add</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                isUpdate && (
                    <UpdatePlaylist onClose={() => setIsUpdate(false)}
                        setPlaylist={setPlaylist}
                        data={playlist} />
                )
            }
            {
                isDelete && (
                    <ConfirmDeletePlaylist onClose={() => setIsDelete(false)}
                        data={playlist}
                    />
                )
            }
            {
                isDeleteSong && (
                    <ConfirmDeleteSongOnPlaylist onClose={() => setIsDeleteSong(false)}
                        data={songSelected}
                        playlistId={playlist?.playlistId}
                    />
                )
            }
        </div >

    )
}

export default Page