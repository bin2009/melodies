"use client";
import { useState } from "react";
import { useAppContext } from "@/app/AppProvider";
import { useRouter } from "next/navigation";
import { BellIcon } from "@radix-ui/react-icons";
import { FaCommentAlt } from "react-icons/fa";
import { IoSettings, IoWallet } from "react-icons/io5";
import { FaCrown } from "react-icons/fa6";
import { Notification as NotificationType } from "@/types/interfaces";
import ShowDeleteComment from "@/components/popup/showDeleteComment";
import { formatTimeCommentNotification } from "@/utils/utils";

const Notification = () => {
  const { listNotification } = useAppContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showModalCmt, setShowModalCmt] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationType>();
  const router = useRouter();
  const handleClickNotification = (notification: NotificationType) => {
    if (notification.type === "PACKAGE" || notification.type === "PAYMENT") {
      router.push("/package");
    } else if (notification.type === "COMMENT") {
      setShowModalCmt(true);
      setNotification(notification);
    }
  };

  return (
    <div className="flex ">
      <div className="flex items-center relative">
        <BellIcon
          onClick={() => setIsOpen(!isOpen)}
          className="w-5 h-5 cursor-pointer"
        />
        {isOpen && (
          <div className="absolute -left-40 px-2 top-8 w-80 max-h-96 bg-black border-2 border-darkBlue shadow-md rounded-xl overflow-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-darkBlue">
            {listNotification?.map((notification) => (
              <div
                key={notification.id}
                className="cursor-pointer p-3 flex flex-col gap-2 my-2 bg-[#2F2F2F] shadow-lg rounded-xl"
                onClick={() => handleClickNotification(notification)}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {notification.type === "COMMENT" && (
                      <FaCommentAlt className="w-4 h-4" />
                    )}
                    {notification.type === "SYSTEM" && (
                      <IoSettings className="w-4 h-4" />
                    )}
                    {notification.type === "PACKAGE" && (
                      <FaCrown className="w-4 h-4" />
                    )}
                    {notification.type === "PAYMENT" && (
                      <IoWallet className="w-4 h-4" />
                    )}
                  </div>
                  <div className="pr-3">
                    <p className="font-semibold text-[0.85rem]">
                      {notification.message}
                    </p>
                    {notification.type === "COMMENT" && (
                      <div className="line-clamp-2 text-[0.8rem] text-gray-200">
                        {notification.report.comment.content}
                      </div>
                    )}
                  </div>
                </div>
                <div className="self-end text-[0.75rem]">
                  {formatTimeCommentNotification(notification.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
        {showModalCmt && (
          <ShowDeleteComment
            onClose={() => setShowModalCmt(false)}
            notification={notification}
          />
        )}
      </div>
      <div className="flex items-start">
        <p className="max-w-10 p-1 bg-darkPink rounded-md text-white text-xs -translate-y-2 truncate">
          100+
        </p>
      </div>
    </div>
  );
};

export default Notification;
