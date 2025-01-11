'use client'
import { useState } from "react";
import { DataPlaylist } from "@/types/interfaces";
import ImagePlaylist from '@/assets/img/placeholderPlaylist.png'
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { LuPen } from "react-icons/lu";
import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { useAppContext as usePlaylistContext } from '@/components/provider/playlistProvider';
interface UpdatePlaylistProps {
    onClose: () => void,
    data?: DataPlaylist,
    setPlaylist: React.Dispatch<React.SetStateAction<DataPlaylist | undefined>>
}
const UpdatePlaylist: React.FC<UpdatePlaylistProps> = ({ onClose, data, setPlaylist }) => {
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
    const { accessToken } = useAppContext()
    const { updatePlaylist } = usePlaylistContext()
    const [updateName, setUpdateName] = useState(data?.name || '')
    const [updateBio, setUpdateBio] = useState(data?.description || '')
    const [selectedImage, setSelectedImage] = useState(data?.image || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setSelectedFile(file)
        }
    };

    const handleUpdate = async (idPlaylist: string) => {
        if (updateName.trim() === '') {
            alert('Name cannot be left blank');
            return;
        }

        const data = {
            title: updateName,
            description: updateBio
        }

        const payload = new FormData();
        payload.append('playlistId', idPlaylist);
        payload.append('data', JSON.stringify(data))
        if (selectedFile) {
            payload.append('playlistAvatar', selectedFile);
        }

        const result = await fetchApiData(`/api/user/playlist/update`, 'PATCH', payload, accessToken)
        if (result.success) {
            setPlaylist((prevData) => {
                if (!prevData) return prevData;
                return {
                    ...prevData,
                    name: updateName,
                    description: updateBio,
                    image: result.data.playlist.image
                };
            });
            updatePlaylist(result.data.playlist)
            onClose();
        }
    }

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-md"
            onClick={handleBackgroundClick}
        >
            <div className="bg-[#222222] w-[35%] rounded-lg p-5 border border-primaryColorBlue">
                <div className="flex justify-between items-center w-full mb-5">
                    <h1 className="font-semibold text-[1.3rem]">Edit details</h1>
                    <IoMdClose className="w-[1.5rem] h-[1.5rem] cursor-pointer"
                        onClick={onClose}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative w-[180px] h-[180px]">
                        <Image
                            src={selectedImage || data?.image || ImagePlaylist}
                            alt="Album Cover"
                            width={180}
                            height={180}
                            priority
                            className="rounded-md object-contain w-full h-full"
                        />
                        <div
                            className='absolute bg-black/60 top-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100'
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <div className='flex flex-col items-center cursor-pointer gap-1'>
                                <LuPen className='w-[2.8rem] h-[2.8rem]' />
                                <p className='text-[0.95rem] tracking-wide'>Select Photo</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            id="fileInput"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                    </div>
                    <div className="flex flex-col flex-1 justify-between">
                        <div className="relative h-[20%] bg-[#333333] rounded-md px-3 py-1 border border-transparent focus-within:border-gray-400 ">
                            <input
                                className="peer w-full h-full bg-transparent text-white text-sm rounded-md transition duration-300 ease focus:outline-none"
                                onChange={(e) => setUpdateName(e.target.value)}
                                value={updateName}
                                placeholder=" "
                                maxLength={150}
                            />
                            <label className={`absolute cursor-text bg-transparent px-1 left-[0.55rem] text-gray-400 text-sm transition-all transform origin-left 
                                        ${updateName ? "-top-2 left-2 text-xs scale-90 bg-gradient-to-b from-[#222222] to-[#333333]" : "top-[0.55rem] left-3 scale-100"}`}>
                                Name
                            </label>
                        </div>

                        <div className="relative h-[70%] bg-[#333333] rounded-md p-3 border border-transparent focus-within:border-gray-400 ">
                            <textarea
                                className="peer w-full h-full bg-transparent text-white text-sm rounded-md transition duration-300 ease focus:outline-none resize-none"
                                onChange={(e) => setUpdateBio(e.target.value)}
                                value={updateBio}
                                placeholder=" "
                                maxLength={150}
                            />
                            <label className={`absolute cursor-text bg-transparent px-1 left-[0.55rem] text-gray-400 text-sm transition-all transform origin-left 
                                        ${updateBio ? "-top-2 left-2 text-xs scale-90 bg-gradient-to-b from-[#222222] to-[#333333]" : "top-3.5 left-3 scale-100"}`}>
                                Description content
                            </label>
                        </div>

                    </div>
                </div>
                <div className="w-full flex justify-end mt-3">
                    <button
                        className='bg-white font-semibold px-6 py-1 text-black rounded-lg'
                        onClick={() => data?.playlistId && handleUpdate(data.playlistId)}
                    >Save</button>
                </div>
                <p className="text-wrap text-[0.8rem] mt-3 text-justify font-bold">By continuing, you agree to allow Melodies to access the images you have selected to upload. Please make sure you have permission to upload the images.</p>

            </div>
        </div>
    )
}

export default UpdatePlaylist