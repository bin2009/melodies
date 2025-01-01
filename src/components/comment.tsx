'use client'
import React, { useEffect, useState } from 'react'
import UserImage from "@/assets/img/placeholderUser.jpg";
import Image from 'next/image';
import {
    FaCircle
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { GoReport } from "react-icons/go";
import { useAppContext } from '@/components/provider/commentProvider';
import { User } from '@/types/interfaces';
import { formatTimeCommentNotification } from '@/utils/utils';
import ReportContent from '@/components/popup/reportComment';
interface CommentProps {
    dataUser?: User;
    time: string | undefined;
    idComment?: string;
    comment?: string;
    role: string
    isMyCmt?: boolean
    showNotification?: boolean
}

const Comment: React.FC<CommentProps> = ({ dataUser, time, comment, idComment, role, isMyCmt, showNotification }) => {
    const [isReply, setIsReply] = useState<boolean | null>(false)
    const [isReport, setIsReport] = useState<boolean>(false)
    const [isOpenReport, setIsOpenReport] = useState<boolean>(false)

    const { replyStatus, setReplyStatus } = useAppContext()
    useEffect(() => {
        setIsReply(replyStatus)
    }, [replyStatus])

    const handleReply = () => {
        setIsReply(!isReply)
        setReplyStatus(!isReply)
    }
    const handleReport = () => {
        setIsReport(false)
        setIsOpenReport(true)
    }

    return (
        <div className={`flex w-full items-center mb-5 ${role === 'children' ? 'pl-14 mb-2' : 'mb-2'}`}>
            <div className='flex'>
                <div className='w-[50px] mr-2'>
                    <Image
                        src={dataUser?.image || UserImage}
                        width={40}
                        height={40}
                        alt="avatar"
                        className="rounded-full w-[40px] h-[40px]"
                    />
                </div>
                <div className='w-[100%]'>
                    <div className='flex items-center'>
                        <p className='font-semibold'>{dataUser?.username}</p>
                        <FaCircle className='w-[6px] h-[6px] text-primaryColorGray mx-3' />
                        <p className='font-light text-primaryColorGray text-[0.9rem]'>{formatTimeCommentNotification(time || '')}</p>
                    </div>
                    <div className='text-[0.9rem]'>
                        <div className='text-[0.9rem] line-clamp-3 hover:line-clamp-none'>
                            <p className='text-justify'>{comment}</p>
                        </div>
                    </div>
                    {
                        !showNotification && (
                            <div className='flex items-center mt-1 relative'>
                                <p
                                    className='inline-block font-semibold text-[0.9rem] hover:cursor-pointer'
                                    onClick={handleReply}
                                >Reply</p>
                                {
                                    !isMyCmt && (
                                        <>
                                            <FiMoreHorizontal
                                                className='ml-2 text-primaryColorGray cursor-pointer'
                                                onClick={() => setIsReport(!isReport)}
                                            />
                                            {
                                                isReport && (
                                                    <div
                                                        className='absolute flex font-semibold items-center bg-colorPopover rounded-lg cursor-pointer z-10 shadow-lg px-2 py-2 top-5 left-10 hover:text-red-500'
                                                        onClick={handleReport}
                                                    >
                                                        <GoReport />
                                                        <p className='ml-2 text-[0.9rem]'>Report</p>
                                                    </div>
                                                )
                                            }
                                            {
                                                isOpenReport && (
                                                    <ReportContent
                                                        onClose={() => setIsOpenReport(false)}
                                                        cmtId={idComment}
                                                    />
                                                )
                                            }
                                        </>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Comment