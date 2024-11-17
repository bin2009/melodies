'use client'
import { useEffect, useState } from "react";
import PlaylistBanner from "@/components/playlistBanner"
import { IoSearch } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { TfiMoreAlt } from "react-icons/tfi";
import Image from "next/image";

const Page = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSongs, setFilteredSongs] = useState<{ title: string; artist: string; album: string; imageUrl: string; }[]>([]);
    const songs = [
        // Quốc tế
        {
            title: "Flowers",
            artist: "Miley Cyrus",
            album: "Endless Summer Vacation",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Kill Bill",
            artist: "SZA",
            album: "SOS",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "As It Was",
            artist: "Harry Styles",
            album: "Harry's House",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Calm Down",
            artist: "Rema feat. Selena Gomez",
            album: "Single",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Anti-Hero",
            artist: "Taylor Swift",
            album: "Midnights",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },

        // Việt Nam
        {
            title: "Bên Trên Tầng Lầu",
            artist: "Tăng Duy Tân",
            album: "Single",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Thích Em Hơi Nhiều",
            artist: "Wren Evans",
            album: "Single",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Nàng Thơ",
            artist: "Hoàng Dũng",
            album: "Single",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Chìm Sâu",
            artist: "MCK feat. Trung Trần",
            album: "Single",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        },
        {
            title: "Hẹn Em Kiếp Sau",
            artist: "Dương Edward",
            album: "Single",
            imageUrl: "https://i.scdn.co/image/ab67616d00001e025a6bc1ecf16bbac5734f23da",
        }
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm === "") {
                setFilteredSongs([]);
            } else {
                const results = songs.filter(song =>
                    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredSongs(results);
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

    return (
        <div className="w-full  bg-secondColorBg">
            <div
                className="m-3 rounded-lg border-2 border-primaryColorBg bg-gradient-to-b to bg-primaryColorBg overflow-auto"
                style={{
                    //   background: `linear-gradient(to bottom, ${dominantColor} 20%, rgba(0, 0, 0, 1) 80%)`,
                }}
            >
                <PlaylistBanner />
                <div className="m-3 flex flex-col pl-5">
                    <div className="flex gap-5 items-center">
                        <IoPlayCircleOutline className="mt-1 w-16 h-16 text-primaryColorPink" />
                        <button className=" text-primaryColorPink">
                            <TfiMoreAlt className="w-5 h-5 shadow-[0_4px_60px_rgba(0,0,0,0.3)]" />
                        </button>
                    </div>
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
                                                src={song.imageUrl}
                                                alt="Song Poster"
                                                width={48}
                                                height={48}
                                                quality={100}
                                                className="object-cover rounded-md"
                                            />
                                            <div className="ml-3">
                                                <p className="font-bold text-primaryColorPink">{song.title}</p>
                                                <p className="font-thin text-primaryColorGray text-[0.9rem]">
                                                    {song.artist}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="font-thin text-primaryColorGray text-[0.9rem]">
                                                {song.album}
                                            </p>
                                        </td>
                                        <td>
                                            <button className="px-4 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300">Add</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >

    )
}

export default Page