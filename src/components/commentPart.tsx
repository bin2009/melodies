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
import { fetchApiData } from '@/app/api/appService';
import { fetchApiData as fetchApiDataAI } from '@/app/api/appServiceAI';

interface CommentPartProps {
    data?: CommentInterface,
    songId: string,
    setTotalCmt: Dispatch<SetStateAction<number>>
}

const CommentPart: React.FC<CommentPartProps> = ({ data, songId, setTotalCmt }) => {
    const [avatar] = useState(localStorage.getItem('avatar') || UserImage)
    const { accessToken } = useAppContext()
    const { replyStatus, setReplyStatus } = useCommentContext()
    const [childrenCmt, setChildrenCmt] = useState<CommentInterface[]>([])
    const [showCmtChild, setShowCmtChild] = useState<boolean>(false)
    const [totalPage, setTotalPage] = useState<number>(100)
    const [isHidden, setIsHidden] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [cmtRemain, setCmtRemain] = useState<number>(data?.hasChild ?? 0)
    const [contentCmt, setContentComment] = useState<string>('')
    const [cmtUp, setCmtUp] = useState<number>(0)
    const [errorPost, setErrorPost] = useState<boolean>(false)

    const ViewChildrenComment = async () => {
        setShowCmtChild(true)
        if (cmtRemain > 0 && page <= totalPage && data?.hasChild !== 0) {
            const result = await fetchApiData(
                `/api/songs/comment/replies/${data?.id}`,
                "GET",
                null,
                accessToken,
                { page: page }
            );

            if (result.success) {
                setChildrenCmt(prevComments => [...prevComments, ...result.data.comments]);
                setTotalPage(result.data.totalPage)
                setPage(prevPage => prevPage + 1)
                setCmtRemain(Math.max((Number(data?.hasChild)) - page * 5, 0));
                setIsHidden(true)
            } else {
                console.error("Login error:", result.error);
            }
        } else {
            setCmtRemain(0)
            setIsHidden(true)
        }
    }

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
                setIsHidden(true)
                setChildrenCmt(prevComments => [response.data.comment, ...prevComments]);
                if (page > totalPage || data?.hasChild === 0) {
                    setCmtRemain(0)
                } else {
                    setCmtRemain((prev) => Number(prev) + 1)
                }
                setCmtUp((prev) => Number(prev) + 1)
                setTotalCmt((prev) => Number(prev) + 1)
            } else {
                setErrorPost(true)
                setTimeout(() => {
                    setErrorPost(false);
                }, 5000);
            }
        } else {
            setErrorPost(true)
            setTimeout(() => {
                setErrorPost(false);
            }, 5000);
        }
        // setLoading(false);
        setContentComment('')
    }

    const handleHidden = () => {
        setIsHidden(false)
        setShowCmtChild(false)
        setCmtRemain((Number(data?.hasChild) ?? 0) + cmtUp);
    }

    return (
        <div>
            <Comment dataUser={data?.user} idComment={data?.id} time={data?.createdAt} comment={data?.content || ''} role='parent' isMyCmt={data?.myComment} />
            {showCmtChild && (
                <div className="">
                    {childrenCmt.length > 0 && (
                        childrenCmt.map((childComment, index) => (
                            <Comment
                                key={childComment.id || index}
                                dataUser={childComment.user}
                                idComment={childComment.id}
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
                    cmtRemain !== 0 && (
                        <div
                            className='flex items-center cursor-pointer group'
                            onClick={ViewChildrenComment}
                        >
                            <div className="w-[2rem] h-[0.1rem] bg-gray-200 font-bold mr-3"></div>
                            <p className='text-[0.85rem] text-gray-200 text-nowrap group-hover:underline'>View {cmtRemain} replies</p>
                            <FaChevronDown className='ml-2 w-3 h-3 text-gray-200 mr-5' />
                        </div>
                    )
                }
                {
                    isHidden && (
                        <div
                            className='flex items-center cursor-pointer group'
                            onClick={handleHidden}
                        >
                            <p className='group-hover:underline text-[0.85rem] text-gray-200'>Hide</p>
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
                                    <span className="font-medium">Danger alert!</span> Your comment violates community standards
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

export default CommentPart
