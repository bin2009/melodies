'use client'
import React, { Dispatch, SetStateAction, useState } from 'react'
import Image from 'next/image';
import UserImage from "@/assets/img/placeholderUser.jpg";
import {
    IoIosSend,
    IoMdClose
} from "react-icons/io";
import Comment from '@/components/comment'
import { useAppContext as useCommentContext } from '@/components/provider/commentProvider'
import { useAppContext } from '@/app/AppProvider';
import {
    FaChevronDown,
    FaChevronUp
} from "react-icons/fa";
import { Comment as CommentInterface } from '@/types/interfaces';
import { fetchApiData as fetchApiDataAI } from '@/app/api/appServiceAI';

interface CommentPartProps {
    data?: CommentInterface,
    songId: string,
    cmtChild: Array<CommentInterface>
    setTotalCmt: Dispatch<SetStateAction<number>>
}

const CommentPartNew: React.FC<CommentPartProps> = ({ data, songId, cmtChild, setTotalCmt }) => {
    const [avatar] = useState(typeof window !== 'undefined' ? localStorage.getItem('avatar') || UserImage : UserImage)
    const { accessToken } = useAppContext()
    const { replyStatus, setReplyStatus } = useCommentContext()
    const [showCmtChild, setShowCmtChild] = useState<boolean>(false)
    const [contentCmt, setContentComment] = useState<string>('')
    const [errorPost, setErrorPost] = useState<boolean>(false)
    const [messageError, setMessageError] = useState<string>('')

    const handleComment = async () => {
        if (contentCmt.trim() === '') return
        setErrorPost(false)
        const payload = {
            songId: songId,
            commentParentId: data?.id,
            content: contentCmt
        }
        const response = await fetchApiDataAI(`/actions/comment`, 'POST', JSON.stringify(payload), accessToken)
        if (response.success) {
            if (response.data.status === 'success') {
                setShowCmtChild(true)
                cmtChild.unshift(response.data.comment)
                setTotalCmt((prev) => prev + 1)
            } else {
                setMessageError(response.data.message)
                setErrorPost(true)
                setTimeout(() => {
                    setErrorPost(false);
                }, 5000);
            }
        } else {
            setMessageError(response.error)
            setErrorPost(true)
            setTimeout(() => {
                setErrorPost(false);
            }, 5000);
        }
        // setLoading(false);
        setContentComment('')
    }

    const handleHidden = () => {
        setShowCmtChild(false)
    }

    return (
        <div>
            <Comment dataUser={data?.user} idComment={data?.id} time={data?.createdAt} comment={data?.content || ''} role='parent' isMyCmt={data?.myComment} />
            {showCmtChild && (
                <div className="">
                    {cmtChild.length > 0 && (
                        cmtChild.map((childComment, index) => (
                            <Comment
                                key={childComment.id || index}
                                idComment={childComment.id}
                                dataUser={childComment.user}
                                time={childComment.createdAt}
                                comment={childComment.content}
                                role="children"
                                isMyCmt={childComment?.myComment}
                            />
                        ))
                    )}
                </div>
            )}
            <div className='flex ml-14 mb-5'>
                {
                    !showCmtChild && cmtChild.length > 0 && (
                        <div
                            className='flex items-center cursor-pointer group'
                            onClick={() => setShowCmtChild(true)}
                        >
                            <div className="w-[2rem] h-[0.1rem] bg-gray-200 font-bold mr-3"></div>
                            <p className='text-[0.85rem] text-gray-200 text-nowrap group-hover:underline'>Xem thêm {cmtChild.length} câu trả lời</p>
                            <FaChevronDown className='ml-2 w-3 h-3 text-gray-200 mr-5' />
                        </div>
                    )
                }
                {
                    showCmtChild && (
                        <div
                            className='flex items-center cursor-pointer group'
                            onClick={handleHidden}
                        >
                            <p className='group-hover:underline text-[0.85rem] text-gray-200'>Ẩn</p>
                            <FaChevronUp className='ml-2 w-2 h-2 text-gray-200' />
                        </div>

                    )
                }
            </div>

            {
                replyStatus && (
                    <>
                        {errorPost && (
                            <div className="ml-14 flex items-center p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-100 animate-slide-up" role="alert">
                                <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                                </svg>
                                <span className="sr-only">Info</span>
                                <div>
                                    <span className="font-medium">Danger alert!</span> {messageError}
                                </div>
                            </div>
                        )}

                        <div className='flex justify-between pl-14 items-center my-5 mb-7'>
                            <div className='w-[100%] mr-2 flex'>
                                <div className='w-[50px] mr-2 flex'>
                                    <Image
                                        src={avatar && avatar !== "null" ? avatar : UserImage}
                                        alt="avatar"
                                        className="rounded-full w-[40px] h-[40px] mr-3"
                                        width={40}
                                        height={40}
                                    />
                                </div>

                                <div className='relative w-[88%]'>
                                    <input
                                        type="text"
                                        className='w-full py-2 bg-transparent border-2 border-white text-[0.9rem] rounded-3xl pl-3 pr-10 focus:outline-none'
                                        placeholder='Thêm bình luận...'
                                        value={contentCmt}
                                        onChange={(e) => setContentComment(e.target.value)}
                                    />
                                    <IoMdClose
                                        className='w-6 h-6 absolute right-3 top-2 cursor-pointer'
                                        onClick={() => setReplyStatus(!replyStatus)}
                                    />
                                </div>
                            </div>

                            <div
                                className='border-2 p-2 rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer'
                                onClick={handleComment}
                            >
                                <IoIosSend />
                            </div>
                        </div>
                    </>
                )
            }
        </div>

    )
}

export default CommentPartNew
