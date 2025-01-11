'use client'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/app/AppProvider';
import { fetchApiData } from '@/app/api/appService';
import { fetchApiData as fetchApiDataAI } from '@/app/api/appServiceAI';
import {
    FaCommentAlt,
    FaCaretUp,
    FaCaretDown
} from "react-icons/fa";
import UserImage from "@/assets/img/placeholderUser.jpg";
import {
    IoIosSend,
    IoMdClose
} from "react-icons/io";
import { CommentProvider } from '@/components/provider/commentProvider';
import CommentPart from '@/components/commentPart';
import Image from 'next/image';
import { Comment } from '@/types/interfaces';
import '@/components/scss/commentSection.scss'
import CommentPartNew from '@/components/commentPartNew';

interface CommentSectionProps {
    id: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ id }) => {
    const { accessToken } = useAppContext()
    const [avatar] = useState(typeof window !== 'undefined' ? localStorage.getItem('avatar') || UserImage : UserImage)
    const sorts = ['Newest', 'Oldest']
    const [valueSort, setValueSort] = useState('Newest')
    const [isClickSort, setIsClickSort] = useState(false)
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalPage, setTotalPage] = useState<number>(100)
    const [totalComment, setTotalCmt] = useState<number>(0)
    const [contentCmt, setContentComment] = useState<string>('')
    const [errorPost, setErrorPost] = useState<boolean>(false)
    const [errorPostContent, setErrorPostContent] = useState<string>('')
    const [newCmt, setNewCmt] = useState<{ data: Comment; cmtChild: Comment[] }[]>([])

    const handleClickSort = () => {
        setIsClickSort(!isClickSort)
    }

    const handleValueSort = (sort: string) => {
        setValueSort(sort)
        setIsClickSort(!isClickSort)
    }

    const fetchComments = async () => {
        setLoading(true);
        const response = await fetchApiData(`/api/songs/comment/${id}`, 'GET', null, accessToken, { page: page })
        if (response.success) {
            const data = await response.data;
            const visibleComments = data.comments.filter((comment: Comment) => comment.hide === false);
            setComments(prevComments => [...prevComments, ...visibleComments]);
            setPage(prevPage => prevPage + 1);
            setTotalPage(data.totalPage)
            setTotalCmt(data.totalComment)
        }
        setLoading(false);
    };

    useEffect(() => {
        setComments([])
        setPage(1)
        fetchComments();
    }, [id]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !loading) {
            if (page <= totalPage) {
                fetchComments()
            }
        }
    };

    const handleComment = async () => {
        if (contentCmt.trim() === '') return
        setErrorPost(false)
        if (accessToken) {
            const payload = {
                songId: id,
                content: contentCmt
            }
            const response = await fetchApiDataAI(`/actions/comment`, 'POST', JSON.stringify(payload), accessToken)
            if (response.success) {
                if (response.data.status === 'success') {
                    setNewCmt((prev) => [{ data: response.data.comment, cmtChild: [] }, ...prev])
                    setTotalCmt((prev) => prev + 1)
                } else {
                    setErrorPost(true)
                    setErrorPostContent('Your comment violates community standards')
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
            setLoading(false);
        } else {
            setErrorPost(true)
            setErrorPostContent('You must be logged in to perform this function')
            setTimeout(() => {
                setErrorPost(false);
            }, 5000);
        }
        setContentComment('')
    }

    return (
        <div className='w-[100%]'>
            <div className='flex justify-between mb-2 items-end'>
                <div className='flex items-center text-primaryColorGray'>
                    <FaCommentAlt />
                    <p className='ml-2'>{totalComment} Comment</p>
                </div>
                <div className='relative'>
                    <button
                        className='cursor-pointer w-[10vw] text-[0.9rem] flex justify-end items-center border-2 border-primaryColorPink p-2 transition duration-300 rounded-md hover:bg-primaryColorPink'
                        onClick={handleClickSort}
                    >
                        Sort by: {valueSort}
                        {
                            isClickSort ? (
                                <FaCaretUp className='ml-2' />
                            ) : (
                                <FaCaretDown className='ml-2' />
                            )
                        }
                    </button>
                    {
                        isClickSort && (
                            <div className='absolute mt-2 left-[40%] bg-colorPopover w-[80px] z-10 rounded-lg'>
                                <ul>
                                    {sorts.map((sort, index) => {
                                        return (
                                            <li
                                                key={index}
                                                onClick={() => handleValueSort(sort)}
                                                className='cursor-pointer text-[0.9rem] text-end p-2 hover:text-primaryColorPink'
                                            >
                                                {sort}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    }
                </div>
            </div>
            <hr className='py-2' />
            <div className="min-h-[120px] max-h-[600px] overflow-auto pr-4 scrollbar-thin scrollbar-thumb-transparent/30 scrollbar-track-transparent" onScroll={handleScroll}>
                {newCmt?.map((comment, index) => (
                    <div key={index}>
                        <CommentProvider>
                            <CommentPartNew data={comment.data} cmtChild={comment.cmtChild} songId={id} setTotalCmt={setTotalCmt} />
                        </CommentProvider>
                    </div>
                ))}
                {comments?.map((comment, index) => (
                    <div key={index}>
                        <CommentProvider>
                            <CommentPart data={comment} songId={id} setTotalCmt={setTotalCmt} />
                        </CommentProvider>
                    </div>
                ))}
                {loading && <p>Đang tải thêm bình luận...</p>}
            </div>
            {
                errorPost && (
                    <div className="flex items-center p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-100 animate-slide-up" role="alert">
                        <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>
                        <span className="sr-only">Info</span>
                        <div>
                            <span className="font-medium">Danger alert!</span>&nbsp;{errorPostContent}
                        </div>
                    </div>
                )
            }
            <div className='flex justify-between items-center mt-5'>
                <div className='w-[100%] mr-2 flex'>
                    <Image
                        src={avatar && avatar !== "null" ? avatar : UserImage}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-full w-[40px] h-[40px] mr-3"
                    />
                    <div className='relative w-[88%]'>
                        <input
                            type="text"
                            className='w-full py-2 bg-transparent border-2 border-white text-[0.9rem] rounded-3xl pl-3 pr-10 focus:outline-none'
                            placeholder='Write a comment'
                            maxLength={150}
                            value={contentCmt}

                            onChange={(e) => setContentComment(e.target.value)}
                        />
                        <IoMdClose
                            className='w-6 h-6 absolute right-3 top-2 cursor-pointer'
                            onClick={() => setContentComment('')}
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
        </div>
    )
}

export default CommentSection