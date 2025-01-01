'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/AppProvider'
import { fetchApiData } from '@/app/api/appService'
import { FaCrown } from "react-icons/fa6";
import Image from 'next/image'
import UserImage from '@/assets/img/placeholderUser.jpg'
import { User } from '@/types/interfaces'

const Page = () => {
    const { accessToken } = useAppContext()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<User>()
    const [name, setName] = useState(user?.name)
    const [username, setUsername] = useState(user?.username)
    const [avatar, setAvatar] = useState(user?.image)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const result = await fetchApiData(`/api/user`, 'GET', null, accessToken)
            if (result.success) {
                setUser(result.data.user)
                setName(result.data.user.name)
                setUsername(result.data.user.username)
                setAvatar(result.data.user.image)
            }
        }
        fetchUser()
    }, [accessToken])

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const file = files[0];

        if (!file) {
            return;
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            alert('Invalid file type. Please select a JPG, PNG, or GIF image.');
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            alert('File size exceeds 1MB. Please choose a smaller file.');
            return;
        }

        if (file) {
            setSelectedFile(file)
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setAvatar(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateInformation = async () => {
        if (username?.trim() === '' || name?.trim() === '') {
            alert('Username or Fullname cannot be left blank');
            return;
        }
        const formData = new FormData();
        const data = {
            username,
            name
        }
        formData.append('data', JSON.stringify(data));
        if (selectedFile) {
            formData.append('image', selectedFile);
        }
        console.log(data);
        const result = await fetchApiData(`/api/user`, 'PATCH', formData, accessToken)
        if (result.success) {
            console.log(result.data);
        }
    }

    return (
        <div className="mt-[8%] w-full min-h-dvh bg-secondColorBg p-3">
            <div className="bg-[#121212] w-full p-8 rounded-xl px-16">
                <div className='flex'>
                    <div className='w-[30%] pl-16 space-y-2'>
                        <p className='font-bold text-[1.5rem] text-pink-500'>Personal Information</p>
                        <p className='text-[0.9rem] w-4/5'>Use a permanent address where you can receive mail.</p>
                    </div>
                    <div className='flex-1 px-36'>
                        <div className='flex items-center gap-5'>
                            <Image
                                src={avatar || UserImage}
                                alt='Avatar'
                                width={100}
                                height={100}
                                quality={100}
                                className='object rounded-md w-[100px] h-[100px]'
                            />
                            <div className='space-y-2'>
                                <button
                                    onClick={handleButtonClick}
                                    className='py-2 px-3 bg-white text-black rounded-lg font-semibold text-[0.9rem]'>Change avatar</button>
                                <input
                                    ref={fileInputRef}
                                    id='avatar-input'
                                    type='file'
                                    accept='image/png, image/jpeg, image/gif'
                                    className='hidden'
                                    onChange={handleImageChange}
                                />
                                <p className='text-[0.8rem]'>JPG, GIF or PNG. 1MB max.</p>
                            </div>
                            {
                                user?.accountType === 'PREMIUM' && (
                                    <FaCrown
                                        className='w-6 h-6 ml-6 text-yellow-400 cursor-pointer'
                                        onClick={() => router.push('/package')}
                                    />
                                )
                            }
                        </div>
                        <div className='mt-8'>
                            <div className='space-y-10'>
                                <div className="relative h-11 w-full min-w-[200px]">
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="text-[0.9rem] peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-pink-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                    />
                                    <label className="font-bold after:content[' '] pointer-events-none absolute left-0 -top-2.5 flex h-full w-full select-none leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-pink-500 after:transition-transform after:duration-300 peer-placeholder-shown:leading-tight peer-placeholder-shown:text-blue-gray-500 peer-focus:text-sm peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:after:scale-x-100 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                        Full Name
                                    </label>
                                </div>
                                <div className="relative h-11 w-full min-w-[200px]">
                                    <input
                                        value={username}
                                        disabled
                                        placeholder="User Name"
                                        className="peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal outline-none placeholder-shown:border-blue-gray-200 focus:border-pink-500 focus:outline-none disabled:border-blue-gray-200 disabled:text-gray-400"
                                    />
                                    <label className="font-bold pointer-events-none absolute left-0 -top-2.5 flex h-full w-full select-none leading-tight text-blue-gray-500 transition-all peer-placeholder-shown:leading-tight peer-placeholder-shown:text-blue-gray-500 peer-focus:text-sm peer-focus:leading-tight peer-focus:text-pink-500 peer-disabled:text-blue-gray-400 peer-disabled:peer-placeholder-shown:text-blue-gray-400">
                                        User Name
                                    </label>
                                </div>
                                <div className="relative h-11 w-full min-w-[200px]">
                                    <input
                                        value={user?.email}
                                        disabled
                                        placeholder="Email Address"
                                        className="peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal outline-none placeholder-shown:border-blue-gray-200 focus:border-pink-500 focus:outline-none disabled:border-blue-gray-200 disabled:text-gray-400"
                                    />
                                    <label className="font-bold pointer-events-none absolute left-0 -top-2.5 flex h-full w-full select-none leading-tight text-blue-gray-500 transition-all peer-placeholder-shown:leading-tight peer-placeholder-shown:text-blue-gray-500 peer-focus:text-sm peer-focus:leading-tight peer-focus:text-pink-500 peer-disabled:text-blue-gray-400 peer-disabled:peer-placeholder-shown:text-blue-gray-400">
                                        Email Address
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateInformation}
                                className='py-1 px-4 bg-pink-500 mt-5 rounded-lg font-semibold text-[0.9rem]'
                            >Save</button>
                        </div>
                    </div>
                </div>
                <div className='w-full h-[1px] bg-slate-400 my-8'>

                </div>
                <div className='flex mt-12'>
                    <div className='w-[30%] pl-16 space-y-2'>
                        <p className='font-bold text-[1.5rem] text-pink-500'>Change password</p>
                        <p className='text-[0.9rem]'>Update your password associated with your account.</p>
                    </div>
                    <div className='px-36 flex-1'>
                        <div className='space-y-10'>
                            <div className="relative h-11 w-full min-w-[200px]">
                                <input
                                    placeholder="Current Password"
                                    className="text-[0.9rem] peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-pink-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                />
                                <label className="font-bold after:content[' '] pointer-events-none absolute left-0 -top-2.5 flex h-full w-full select-none leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-pink-500 after:transition-transform after:duration-300 peer-placeholder-shown:leading-tight peer-placeholder-shown:text-blue-gray-500 peer-focus:text-sm peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:after:scale-x-100 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                    Current Password
                                </label>
                            </div>
                            <div className="relative h-11 w-full min-w-[200px]">
                                <input
                                    placeholder="New Password"
                                    className="text-[0.9rem] peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-pink-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                />
                                <label className="font-bold after:content[' '] pointer-events-none absolute left-0 -top-2.5 flex h-full w-full select-none leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-pink-500 after:transition-transform after:duration-300 peer-placeholder-shown:leading-tight peer-placeholder-shown:text-blue-gray-500 peer-focus:text-sm peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:after:scale-x-100 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                    New Password
                                </label>
                            </div>
                            <div className="relative h-11 w-full min-w-[200px]">
                                <input
                                    placeholder="Confirm New Password"
                                    className="text-[0.9rem] peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-pink-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                />
                                <label className="font-bold after:content[' '] pointer-events-none absolute left-0 -top-2.5 flex h-full w-full select-none leading-tight text-blue-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-pink-500 after:transition-transform after:duration-300 peer-placeholder-shown:leading-tight peer-placeholder-shown:text-blue-gray-500 peer-focus:text-sm peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:after:scale-x-100 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                    Confirm New Password
                                </label>
                            </div>
                        </div>
                        <button
                            className='py-1 px-4 bg-pink-500 mt-5 rounded-lg font-semibold text-[0.9rem]'
                        >Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page