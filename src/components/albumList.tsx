"use client";
import PropTypes from "prop-types";
import React from "react";
import Image from "next/image";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAppContext } from "@/components/provider/songProvider";
import { useRouter } from 'next/navigation';
import { DataAlbum } from "@/types/interfaces";
import { getPoster } from "@/utils/utils";

interface AlbumListProps {
    maintitle?: string;
    subtitle?: string;
    data?: Array<DataAlbum>;
}

const AlbumList: React.FC<AlbumListProps> = ({ maintitle, subtitle, data }) => {
    const sortedData = data?.slice().sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    const router = useRouter();
    const { showSidebarRight } =
        useAppContext();

    return (
        <div className="w-full">
            <h1 className="text-h1 mb-5">
                {maintitle} <span className="text-primaryColorPink">{subtitle}</span>
            </h1>

            <div
                id="list"
                className="w-full flex flex-wrap gap-3 items-stretch"
            >
                {(showSidebarRight ? sortedData?.slice(0, 4) : sortedData?.slice(0, 5))?.map(
                    (album, index) => {
                        const poster = getPoster(album)
                        return (
                            <div
                                key={index}
                                className={`bg-[#1F1F1F] p-2 px-3 mr-3 ${showSidebarRight ? "w-[12vw]" : "w-[13vw]"
                                    } rounded-lg cursor-pointer flex flex-col`}
                            >
                                <Image
                                    src={poster}
                                    alt="Song Poster"
                                    width={400}
                                    height={400}
                                    className="mb-2 rounded-md"
                                />
                                <div className="flex flex-col justify-between">
                                    <p
                                        className={`${showSidebarRight ? "" : "text-h4"
                                            } font-semibold mb-1 line-clamp-2 cursor-pointer hover:underline`}
                                        onClick={() => router.push(`/album/${album.albumId}`)}
                                    >
                                        {album.title}
                                    </p>
                                    <p
                                        className="text-[0.8rem] font-thin mb-1 line-clamp-1 cursor-auto"
                                    >
                                        {new Date(album.releaseDate).getFullYear()}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                )}
                <div className="flex flex-col items-center cursor-pointer justify-center">
                    <PlusIcon
                        className={`${showSidebarRight ? "w-[40px] h-[40px]" : "w-[50px] h-[50px]"
                            } bg-[#1F1F1F] rounded-full p-3 mb-2`}
                    />
                    <p
                        className={`${showSidebarRight ? "font-semibold text-[0.9rem]" : "text-h4"
                            } whitespace-nowrap`}
                    >
                        View All
                    </p>
                </div>
            </div>
        </div >
    );
};

// Define PropTypes as a fallback for runtime validation
AlbumList.propTypes = {
    maintitle: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
};

export default AlbumList;
