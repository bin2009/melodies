"use client";
import { Input } from "@/components/ui/input";
import { PlusIcon, EnterIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/AppProvider";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import bannerImg from "@/assets/img/together2.png";
import { useRouter } from "next/navigation";
import { DataCurrentRoom } from "@/types/interfaces";

function Page() {
  const { socket } = useAppContext();
    const { toast } = useToast()
  const [textIndex, setTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [roomId, setRoomId] = useState<string>("");
  const router = useRouter();
  const messages = [
    "Let's experience with Melodies",
    "Enjoy listening to music together",
  ];

  useEffect(() => {
    socket?.emit("CheckHasJoinedRoom");

    socket?.once("CheckHasJoinedRoomSuccess", (id) => {
      router.push(`/listenTogether/${id}`);
    })
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setTextIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsVisible(true);
      }, 500); // Match fade-out duration
    }, 4000); // Total duration for each message
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = async () => {
    socket?.emit("joinRoom", {roomId: roomId, link: false});
    socket?.once("joinRoomSuccess", (data: DataCurrentRoom) => {
      console.log("Join Success to room:", data.roomData.id);
      router.push(`/listenTogether/${data.roomData.id}`);
    });
    socket?.once("joinRoomFailed", (data) => {
      // alert(data);
      toast({
        title: "Error",
        description: `Join room failed. "${data}"`,
        variant: "destructive",
      });
    });
  };

  const handleCreateRoom = async () => {
    // console.log("Create room");
    socket?.emit("createRoom");
    console.log("Create room");
    socket?.once("createRoomSuccess", (id) => {
      console.log("Create room success: " + id);
      router.push(`/listenTogether/${id}`);
    });
    socket?.once("createRoomFailed", (data) => {
      // console.log("createRoomFailed", data);
      toast({
        title: "Error",
        description: `Create room failed. "${data}"`,
        variant: "destructive",
      });
      // alert(data);
    });
  };

  return (
    <div className="w-full mt-20 m-6 p-8 gap-12 flex justify-between items-center">
      <div className="w-1/2 flex flex-col gap-6 items-start">
        <h1
          className={`text-4xl font-bold transition-opacity duration-500 text-primaryColorPink leading-normal ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {messages[textIndex]}
        </h1>
        <h2 className="text-xl font-bold text-white/90">
          No matter where you are.
        </h2>
        <h2 className="text-base text-white/90">
          Grab some friends, join a room and listen to music in sync with each
          other
        </h2>
        <div className="w-full flex flex-col gap-4 items-start bg-darkerPink p-4 rounded-md shadow-md">
          <p className="text-textLight text-sm">
            Start a new room to enjoy synchronized music with your friends.
          </p>
          <button
            onClick={handleCreateRoom}
            className="w-fit p-3 text-textMedium font-bold bg-primaryColorPink flex items-center gap-2 rounded-md shadow-md hover:bg-darkPinkHover transition-all duration-300"
          >
            <PlusIcon className="text-white w-5 h-5 stroke-white" />
            Create a room
          </button>
        </div>
        <div className="w-full flex flex-col gap-4 items-start bg-darkerBlue p-4 rounded-md shadow-md">
          <p className="text-textLight text-sm">
            Enter the Room ID to join and listen together with others.
          </p>
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/3 border-primaryColorBlue focus:outline-none focus:ring focus:ring-primaryColorBlue/50"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              maxLength={150}
            />
            <button
              onClick={handleJoinRoom}
              className="p-3 text-textMedium font-bold bg-primaryColorBlue flex items-center shrink-0 gap-2 rounded-md shadow-md hover:bg-darkBlueHover transition-all duration-300"
            >
              <EnterIcon className="text-white w-5 h-5 stroke-white" />
              Join room
            </button>
          </div>
        </div>
      </div>

      <div className="w-3/4 rounded-2xl  shadow-primaryColorPinkHover">
        <Image src={bannerImg} alt="gif" className="rounded-2xl " />
      </div>
    </div>
  );
}

export default Page;
