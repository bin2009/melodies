'use client'
import UpdatePlaylist from '@/components/popup/updatePlaylist';
import { DataPlaylist } from '@/types/interfaces';
import { getPosterPlaylist } from '@/utils/utils';
import Image from 'next/image'
import React, { useState } from 'react'
import { LuPen } from "react-icons/lu";

interface PlaylistBannerProps {
    data: DataPlaylist;
}

const PlaylistBanner: React.FC<PlaylistBannerProps> = ({ data }) => {
    const [isUpdate, setIsUpdate] = useState<boolean>()
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

    return (
        <div className=" w-full h-[50vh] p-5 pl-8 flex flex-col justify-end gap-6 rounded-t-lg bg-gradient-to-b from-transparent to-black/30">
            {/* Header */}
            {/* Content albums */}
            <div className="flex items-end gap-8">
                <div className="relative shadow-[0_4px_60px_rgba(0,0,0,0.5)] rounded-md ">
                    <Image
                        src={getPosterPlaylist(data)}
                        alt="Album Cover"
                        width={220}
                        height={220}
                        priority
                        className="rounded-md"
                    />
                    <div className='absolute bg-black/60 top-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100'>
                        <div
                            className='flex flex-col items-center cursor-pointer gap-1'
                            onClick={() => setIsUpdate(true)}
                        >
                            <LuPen className='w-[3.5rem] h-[3.5rem]' />
                            <p className='text-[0.95rem] tracking-wide'>Edit playlist</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 flex-col">
                    <h3>Playlist</h3>
                    <h1
                        className="mt-2 text-6xl font-bold cursor-pointer"
                        onClick={() => setIsUpdate(true)}
                    >{data?.name}</h1>
                    <p>{data.description}</p>
                    <div className="mt-1 flex items-center space-x-2 text-h4 font-semibold">
                        <p>{data.username}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-gray-300">{new Date(data.createdAt).getFullYear()}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-gray-300">{data?.totalSong} {data.totalSong > 1 ? 'songs' : 'song'}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-gray-300">{formatDuration(data?.totalTime ?? 0)}</p>
                    </div>
                </div>
            </div>
            {
                isUpdate && (
                    <UpdatePlaylist onClose={() => setIsUpdate(false)} />
                )
            }
        </div>
    )
}

export default PlaylistBanner