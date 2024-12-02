"use client";

import { Input } from "@/components/ui/input";
import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useRef, useCallback } from "react";
// import { io, Socket } from "socket.io-client";
import { useAppContext } from "@/app/AppProvider";
import LoadingPage from "@/components/loadingPage";
import { fetchApiData } from "@/app/api/appService";
import { DataSong } from "@/types/interfaces";
import { decrypt } from "@/app/decode";
import Image from "next/image";
import { getMainArtistName, getPosterSong } from "@/utils/utils";
import { IoSearch } from "react-icons/io5";

// let socket: Socket | null = null;

function Page() {
  const { loading, setLoading } = useAppContext();
  const { socket } = useAppContext();
  const { accessToken } = useAppContext();
  const [roomId, setRoomId] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [permit, setPermit] = useState(true);

  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    { user: object; message: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<DataSong[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [members, setMembers] = useState<string[]>([]);

  const handleTimeUpdate = () => {
    if (audioRef.current && permit) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // const accessToken = "hihi"
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchTerm === "") {
        setFilteredSongs([]);
      } else {
        const results = await fetchApiData(
          `/api/songs/search`,
          "GET",
          null,
          null,
          { query: searchTerm, page: 1 }
        );
        if (results.success) {
          setFilteredSongs(results.data.songData);
        }
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // useEffect(() => {
  //   // Khởi tạo socket
  //   // socket = io("https://1vtglwl3-20099.asse.devtunnels.ms");

  //   // socket.on("connect", () => {
  //   //   console.log("Đã kết nối tới server:", socket?.id);
  //   // });
  //   if (!socket) return;

  //   // // socket.emit("JoinRoom", { roomId: "someRoomId" });
  //   // socket.emit("Error", (message) => {
  //   //   console.log("Error:", message);
  //   // });
  //   // socket.on("CreateRoomSuccess", (id) => {
  //   //   console.log("Đã kết nối tới room:", id);
  //   // });

  //   // socket.on("JoinRoomSuccess", (data) => {
  //   //   console.log("Join Success to room:", data);
  //   //   setPermit(data.permit);
  //   // });

  //   // socket.on("Users", (id) => {
  //   //   console.log("Userid:", id);
  //   // });

  //   // socket.on("PermissionUpdateFail", (status) => {
  //   //   setPermit(status);
  //   //   console.log("Permission update fail:", status); // Ghi log giá trị status
  //   // });

  //   // socket.on("UpdateAudio", (data) => {
  //   //   console.log("Update audio:", data);
  //   //   if (audioRef.current) {
  //   //     audioRef.current.currentTime = data.currentTime;
  //   //     if (data.isPlaying) {
  //   //       audioRef.current.play();
  //   //     } else {
  //   //       audioRef.current.pause();
  //   //     }
  //   //   }
  //   // });

  //   // socket.on("ServerSendMessage", (data) => {
  //   //   console.log("Message:", data);
  //   //   setChatMessages((prevMessages) => [
  //   //     ...prevMessages,
  //   //     { user: data.user.username, message: data.message },
  //   //   ]);
  //   // });

  //   return () => {
  //     socket?.disconnect();
  //     setVisible(false);
  //     console.log("Đã ngắt kết nối socket");
  //   };
  // }, []);

  useEffect(() => {
    if (!socket) return;

    socket?.on("UpdateAudio", (data) => {
      console.log("Update audio:", data);
      if (audioRef.current) {
        audioRef.current.currentTime = data.currentTime;
        if (data.isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    });

    socket?.on("memberJoined", (data) => {
      console.log("member: ", data.username);
    });

    socket?.on("memberLeft", (data) => {
      console.log("member đã rời khỏi: ", data.username);
    });

    socket?.on("members", (data) => {
      console.log("members: ", data);
      setMembers(data);
    });

    socket?.on("leaveRoomFailed", () => {
      console.log("leaveRoomFailed");
    });

    socket?.on("roomClosed", () => {
      setVisible(false);
      console.log("host đã thoát");
      socket.emit("leaveRoom");
      socket.on("leaveRoomSuccess", () => {
        console.log("Leave room success");
        setVisible(false);
      });
    });

    socket?.on("ServerSendMessage", (data) => {
      console.log("Received message data:", data);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { user: data.user, message: data.message },
      ]);
    });

    socket?.on("disconnect", () => {
      console.log("Đã ngắt kết nối socket");
      setVisible(false);
    });

    return () => {
      socket.off("UpdateAudio");
      socket.off("memberJoined");
      socket.off("memberLeft");
      socket.off("members");
      socket.off("leaveRoomFailed");
      socket.off("roomClosed");
      socket.off("ServerSendMessage");
      socket.off("disconnect");
    };
  }, [socket]);

 

  const handleJoinRoom = async () => {
    socket?.emit("joinRoom", roomId);
    socket?.on("joinRoomSuccess", (data) => {
      console.log("Join Success to room:", data.roomId);
      setPermit(data.permit);
      setVisible(true);
    });
    socket?.on("joinRoomFailed", (data) => {
      console.log("joinRoomFailed", data);
    });
  };

  const handleCreateRoom = async () => {
    socket?.emit("createRoom");
    socket?.on("createRoomSuccess", (id) => {
      console.log("Create room success: " + id);
      setVisible(true);
    });
    socket?.on("createRoomFailed", (data) => {
      console.log("createRoomFailed", data);
    });
  };

  const handleLeaveRoom = async () => {
    socket?.emit("leaveRoom");
    socket?.on("leaveRoomSuccess", () => {
      console.log("Leave room success");
      setVisible(false);
    });
  };

  const handlePlay = () => {
    if (permit) {
      socket?.emit("SyncAudio", {
        accessToken: accessToken,
        currentTime: currentTime,
        isPlaying: true,
      });
    }
  };

  const handlePause = () => {
    if (permit) {
      socket?.emit("SyncAudio", {
        accessToken: accessToken,
        currentTime: currentTime,
        isPlaying: false,
      });
    }
  };

  const handleSentMessage = () => {
    socket?.emit("SendMessage", {
      accessToken: accessToken,
      message: message,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  return (
    <div className="w-full my-20 m-6 p-8 flex flex-col gap-4">
      <div className="flex mb-5 gap-6 items-center">
        <div className="">
          <button
            onClick={handleCreateRoom}
            className="p-2 text-textMedium bg-primaryColorPink flex items-center shrink-0 gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
          >
            <PlusIcon className="text-white w-5 h-5" />
            Create a room
          </button>
        </div>
        <div className="flex w-1/4 gap-2 items-center">
          <Input
            className="border-white"
            placeholder="enter room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={handleJoinRoom}
            className="p-2 text-textMedium bg-primaryColorPink flex items-center shrink-0 gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
          >
            Join room
          </button>
          <button
            onClick={handleLeaveRoom}
            className="p-2 text-textMedium bg-primaryColorPink flex items-center shrink-0 gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
          >
            Leave Room
          </button>
        </div>
      </div>

      {visible === true && (
        <div className="w-full flex justify-between gap-4">
          <h1>List user</h1>
          <ul>
            {/* {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))} */}

            {members.map((member, index) => {
              const memberId = Object.keys(member)[0];
              const memberInfo = member[memberId];
              return (
                <li key={index} style={{ display: "flex" }}>
                  <img
                    src={memberInfo.image}
                    alt={memberInfo.username}
                    height="30"
                    width="30"
                  />
                  {memberInfo.username} {/* Hiển thị tên người dùng */}
                </li>
              );
            })}
          </ul>
          <div className="w-1/3 flex flex-col gap-4">
            <h1 className="text-primaryColorPink">List Music</h1>
            <div className="w-full">
              <audio
                ref={audioRef}
                controls
                onPause={permit ? handlePause : undefined}
                onPlay={permit ? handlePlay : undefined}
                onTimeUpdate={permit ? handleTimeUpdate : undefined}
                className={!permit ? "pointer-events-none opacity-50" : ""}
              >
                <source
                  // src="https://audiomelodies.nyc3.digitaloceanspaces.com/AUDIO/OLD/HoangThuyLinh/VIETNAMESECONCERTTHEALBUM/BanhTroiNuocVietnameseConcertEdition.m4a"
                  src={decrypt(
                    "U2FsdGVkX1/SJM4yu3157rno3f0JC1AY1vLJhSn4tNlnszs7Bqn4vhiNmZCi4Th79Rsa1Wa2RDqkcGru94ff1DZjvWXG8Vdr8TBRTBduMkUD1AAmjI9fCl3B2pzPsd/0jMpNItmuu4dn3qSCss33pDZrt4UQ6M5BGVOSbP28s8MpL9L69b4Y8mt4sj3xLYIe"
                  )}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="w-full h-[400px] bg-slate-200 text-black flex flex-col gap-4 p-4">
              <div className="w-full flex gap-4">
                <Input
                  placeholder="enter message"
                  className="text-black"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></Input>
                <button
                  onClick={handleSentMessage}
                  className="h-[45px] p-2 text-textMedium bg-primaryColorPink rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
                >
                  Sent
                </button>
              </div>

              <div className="w-full border border-primaryColorBlue">
                {chatMessages.map((msg, index) => (
                  <div key={index}>
                    <p style={{display: "flex"}}><img src={msg.user.image} alt={msg.user.username} height="30" width="30"/> {msg.user.username} : {msg.message}</p>
                    {/* <h3>{msg.message}</h3> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-1/4 h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
            <div>
              <p className="font-bold text-ml mb-3">
                Let&apos;s find content for your playlist
              </p>
              <div className="flex items-center bg-[#2C2C2C] w-[35%] p-2 gap-2 rounded-md">
                <IoSearch className="text-[1.2rem]" />
                <input
                  type="text"
                  placeholder="Find songs"
                  className="focus:outline-none placeholder:text-[0.9rem] placeholder:text-primaryColorGray text-primaryColorGray text-[0.9rem] bg-transparent w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <table className="max-w-full text-white border-separate border-spacing-y-3 ">
              <thead className="w-full max-h-[32px]">
                <tr>
                  <th className="w-[75%] pl-4"></th>
                  <th className="w-[25%] pl-4"></th>
                </tr>
              </thead>
              <tbody className="mt-4">
                {filteredSongs.length > 0 &&
                  filteredSongs.map((song, index) => (
                    <tr key={index}>
                      <td className="relative group flex pr-2">
                        <Image
                          src={getPosterSong(song.album).image}
                          alt="Song Poster"
                          width={48}
                          height={48}
                          quality={100}
                          className="object-cover rounded-md w-10 h-10"
                        />
                        <div className="ml-3">
                          <p className="font-bold text-white">{song.title}</p>
                          <p className="font-thin text-primaryColorGray text-[0.9rem]">
                            {getMainArtistName(song.artists)}
                          </p>
                        </div>
                      </td>
                      <td>
                        <button
                          className="px-4 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300"
                          // onClick={() => handleAddSong(song.id)}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
