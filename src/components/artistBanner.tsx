'use client'
import React, { useState } from "react";
import tinycolor from "tinycolor2";
import { useAppContext as useSongContext } from '@/components/provider/songProvider';
import './scss/artistBanner.scss'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Artist } from "@/types/interfaces";
import { Toast, ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/app/AppProvider";
import { fetchApiData } from "@/app/api/appService";

interface BannerProps {
    data?: Artist
    color?: string
}
const ArtistBanner: React.FC<BannerProps> = ({ data, color }) => {
    const { toast } = useToast()
    const { accessToken } = useAppContext()
    const { showSidebarRight } = useSongContext();
    const [tym, setTym] = useState<boolean>(data?.followed ?? false)
    const [follower, setFollower] = useState<number>(data?.totalFollow ?? 0)

    const handleTymArtist = async () => {
        const payload = {
            artistId: data ? data.id : undefined
        }
        if (accessToken) {
            const response = await fetchApiData('/api/user/actions/followed', 'POST', JSON.stringify(payload), accessToken);
            if (response.success) {
                setTym(!tym)
                setFollower((prev) => (tym ? prev - 1 : prev + 1));
            }
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: 'You must be logged in to perform this function',
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    }

    const darkerColor = tinycolor(color).darken(30).toString();

    return (
        <div
            className={`w-[100%] h-[60vh] px-6 py-4 rounded-t-2xl bg-cover bg-center flex gap-[114px] flex-col relative overflow-hidden`}
        >
            {/* Pseudo-element for background image */}
            <div
                className="background-image-with-blur absolute inset-0 z-10 bg-contain transform bg-no-repeat rounded-lg"
                style={{
                    backgroundImage: `url(${data?.avatar})`,
                    backgroundSize: '220px',
                    backgroundPosition: `5% calc(100% - 30px)`,
                }}
            />

            <div
                className={`absolute inset-0 bg-contain transform bg-right bg-no-repeat background-with-blur`}
                style={{
                    '--background-image': `url(${data?.avatar})`,
                    // backgroundPosition: `center calc(100% - 200px)`
                } as React.CSSProperties}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to right, #000000 40%, ${darkerColor} 98%)`,
                    opacity: 0.8, // Điều chỉnh độ mờ của lớp phủ nếu cần
                }}
            />

            <div className={`z-10 absolute  line-clamp-1 ${showSidebarRight ? 'top-[61%] left-[33%] ' : 'top-[58%] left-[26%]'}`}>
                <div className="flex items-center mb-3">
                    <svg className="w-[16px] text-[#4CB3FF]" data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M10.814.5a1.658 1.658 0 0 1 2.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 0 1 1.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 0 1-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 0 1-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 0 1-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 0 1 0-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 0 1 1.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z"></path></svg>
                    <p className="text-[0.9rem] ml-2">Verified Artist</p>
                </div>
                <p className={`font-bold ${showSidebarRight ? 'text-6xl' : 'text-7xl'}  mb-4`}>{data?.name}</p>
                <div
                    className="flex items-end cursor-pointer text-[1.2rem]"
                    onClick={handleTymArtist}
                >
                    {tym ? (
                        <FaHeart className="text-[#F75050] ml-[0.75%] mt-[0.75%] text-[1.7rem] transition-transform duration-300 hover:scale-[1.1]" />
                    ) : (
                        <FaRegHeart className="text-[#F75050] ml-[0.75%] mt-[0.75%] text-[1.7rem] transition-transform duration-300 hover:scale-[1.1]" />
                    )}
                    <p className="ml-2 text-[0.95rem]">{follower.toLocaleString()} followers</p>
                </div>
            </div>
        </div>

    );
}

export default ArtistBanner;
