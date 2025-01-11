import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useAppContext } from "@/app/AppProvider";
import Image from "next/image";
import userImg from "@/assets/img/placeholderUser.jpg";
import { Message } from "@/types/interfaces";
function ChatMessage({myId} : {myId: string}) {
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const { socket } = useAppContext();

  useEffect(() => {
    if (!socket) return;
    socket.on("ServerSendMessage", (data) => {
      setChatMessages((prevMessages) => [
        { user: data.user, message: data.message, userSend: data.userSend },
        ...prevMessages,
      ]);
    });
    return () => {
      socket?.off("ServerSendMessage");
    };
  }, [socket]);

  const handleSentMessage = () => {
    socket?.emit("SendMessage", {
      message: message,
    });
    console.log("message", message);
    setMessage("");
  };

  return (
    <div className="w-full flex-grow text-white flex flex-col gap-4 p-4 bg-secondColorBg rounded-lg">
      <div className="w-full flex gap-4 items-center">
        <Input
          placeholder="Enter message"
          className="text-white border-primaryColorBlue h-10 rounded-lg"
          maxLength={100}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></Input>
        <button
          onClick={handleSentMessage}
          className="h-9 w-9 p-2 text-textMedium bg-primaryColorPink rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
        >
          <PaperPlaneIcon className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="w-full flex flex-col-reverse gap-2 text-white overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
        <div className="max-h-[430px] flex flex-col gap-2">

        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`w-fit flex gap-2 items-center py-1 px-2 border rounded-full  ${msg.userSend == myId ? 'ml-auto bg-darkerBlue/50': 'ml-0 bg-darkerPink/40'}`} // Thêm điều kiện
          >
            <Image
              src={msg.user?.image || userImg}
              alt="song"
              width={30}
              height={30}
              className="rounded-full h-7 w-7"
            />
            <h3 className="flex-1 text-sm break-words overflow-wrap-break-word word-break-break-word">
              <span className="text-primaryColorPink mr-2 text-sm font-bold">
                {msg.user?.username}
              </span>
              {msg.message}
            </h3>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
