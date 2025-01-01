import { fetchApiData } from '@/app/api/appService';
import { Artist } from '@/types/interfaces';
import Image from 'next/image'
import ImageArtist from '@/assets/img/placeholderUser.jpg'
import React, { useEffect, useState } from 'react'

import { FiUserPlus, FiUserMinus } from "react-icons/fi";
import {
    MdAudiotrack,
    MdOutlinePeopleAlt
} from "react-icons/md";
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface AvatarArtistProps {
    id?: string
}

const AvatarArtist: React.FC<AvatarArtistProps> = ({ id }) => {
    const router = useRouter()
    const { toast } = useToast()
    const { accessToken } = useAppContext()
    const [artist, setArtist] = useState<Artist>()
    const [tym, setTym] = useState<boolean>(artist?.followed ?? false)
    const [follower, setFollower] = useState<number>(artist?.totalFollow ?? 0)

    const handleTymArtist = async () => {
        const payload = {
            artistId: artist ? artist.id : undefined
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

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                const result = await fetchApiData(`/api/artist/${id}`, "GET", null, accessToken);
                if (result.success) {
                    setArtist(result.data.artist)
                    setFollower(result.data.artist.totalFollow)
                    setTym(result.data.artist.followed)
                } else {
                    console.error("Login error:", result.error);
                }
            };

            fetchData();
        }

    }, [id]);
    return (
        <div>
            <div className='w-[150px] h-[150px]'>
                <Image
                    src={artist?.avatar || ImageArtist}
                    alt="Song Poster"
                    width={500}
                    height={500}
                    quality={100}
                    className='w-full h-full object-cover rounded-full shadow-md'
                />
                <p
                    className='text-[0.95rem] font-semibold mt-3 my-2 cursor-pointer'
                    onClick={() => router.push(`/artist/${id}`)}
                >{artist?.name}</p>
                <div className='flex gap-4 mb-3'>
                    <div title={`${artist?.totalFollow.toLocaleString()} followers`} className='flex items-center'>
                        <MdOutlinePeopleAlt /> <span className='text-primaryColorGray text-[0.8rem] ml-1'>{follower.toLocaleString()}</span>
                    </div>
                    <div title={`${artist?.totalSong} tracks`} className='flex items-center'>
                        <MdAudiotrack /> <span className='text-primaryColorGray text-[0.8rem] ml-1'>{artist?.totalSong}</span>
                    </div>
                </div>
                <button
                    className='flex items-center bg-primaryColorPink px-3 py-1 rounded-[2px] gap-2'
                    onClick={handleTymArtist}
                >
                    {
                        tym ? (
                            <>
                                <FiUserMinus /> <span className='text-[0.7rem]'>Unfollow</span>
                            </>
                        ) : (
                            <>
                                <FiUserPlus /> <span className='text-[0.7rem]'>Follow</span>
                            </>
                        )
                    }
                </button>
            </div>
        </div>
    )
}

export default AvatarArtist