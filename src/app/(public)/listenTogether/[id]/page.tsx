"use client";
import {
  Cross2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/app/AppProvider";
import { fetchApiData } from "@/app/api/appService";
import {
  DataCurrentRoom,
  DataCurrentSong,
  DataMembersRoom,
  DataSong,
  UserRoom,
} from "@/types/interfaces";
import Image from "next/image";
import { getMainArtistInfo, getPosterSong } from "@/utils/utils";
import { IoSearch } from "react-icons/io5";
import ChatMessage from "@/components/listenTogether/chatMessage";
import ProposalList from "@/components/listenTogether/proposalList";
import { useToast } from "@/hooks/use-toast";
import SongPlayedBanner2 from "@/components/listenTogether/songPlayerBanner2";
import ListUser from "@/components/listenTogether/listUser";
import animation from "../../../../../public/animation/Animation - song.json";
import Lottie from "react-lottie-player";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

function Page({ params }: PageProps) {
  const { id } = params;
  const { socket } = useAppContext();
  const { accessToken } = useAppContext();
  const [permit, setPermit] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<DataSong[]>([]);
  // check
  const [currentProposalList, setCurrentProposalList] = useState<DataSong[]>(
    []
  );
  const [waitingSongs, setWaitingSongs] = useState<DataSong[]>([]);
  const [currentSong, setCurrentSong] = useState<DataCurrentSong | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [listUser, setListUser] = useState<UserRoom[]>([]);
  const [enableAnimation, setEnableAnimation] = useState(true);
  const [myId, setMyId] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { roomId: id, link: true });
  }, [socket, id]);

  const handleViewUser = () => {
    setShowUsers((prev) => !prev);
  };

  // use effect search song
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchTerm === "") {
        setFilteredSongs([]);
      } else {
        const results = await fetchApiData(
          `/api/songs/search`,
          "GET",
          null,
          accessToken,
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

  useEffect(() => {
    if (!socket) return;

    socket.on("memberJoined", (data: DataMembersRoom) => {
      console.log("Member joined: ", data.user.id);
      setListUser(data.members);
    });

    socket.on("memberLeft", (data: DataMembersRoom) => {
      console.log("Member left: ", data.user.id);
      setListUser(data.members);
    });

    socket.on("joinRoomLinkFailed", (data) => {
      // alert(data);
      toast({
        title: "Error",
        description: `Join room by link failed. "${data}"`,
        variant: "destructive",
      });
      router.push(`/listenTogether`);
    });

    socket.on("joinRoomLinkSuccess", (data: DataCurrentRoom) => {
      console.log("lay du lieu moi cua phong");
      setListUser(data.roomData.members);
      setPermit(data.isHost);
      setWaitingSongs(data.roomData.waitingList);
      setCurrentProposalList(data.roomData.proposalList);
      setCurrentSong(data.roomData.currentSong);
      setEnableAnimation(data.roomData.currentSong.isPlaying);
      setMyId(data.myId);
    });

    socket.on("roomClosed", (data) => {
      console.log(data);
      toast({
        title: "Error",
        description: `Room closed. "${data}"`,
        variant: "destructive",
      });
      // alert(data);
      router.back();
    });

    socket.on("leaveRoomSuccess", () => {
      toast({
        title: "Success",
        description: "Leave room success",
        variant: "success",
      });
      // alert("Leave room success");
      console.log("Leave room success");
      router.push(`/listenTogether`);
    });

    socket.on("addSongToWaitingListFailed", (data) => {
      toast({
        title: "Error",
        description: `Add song to waiting list failed. "${data}"`,
        variant: "destructive",
      });
      // alert(data);
    });

    socket.on("addSongToWaitingListSuccess", () => {
      toast({
        title: "Success",
        description: "Add song to waiting list success",
        variant: "success",
      });
      // alert("them bai playlist ok");
    });

    socket.on("updateWaitingList", (waitingList) => {
      setWaitingSongs(waitingList);
    });

    socket.on("updateListSong", (data) => {
      // console.log("list wait: ", data.waitingList);
      setWaitingSongs(data.waitingList);
    });

    socket.on("playSong", (currentSong) => {
      setCurrentSong(currentSong);
    });

    socket.on("animation", (data) => {
      setEnableAnimation(data);
    });

    return () => {
      socket.off("memberJoined");
      socket.off("memberLeft");
      socket.off("joinRoomLinkFailed");
      socket.off("joinRoomLinkSuccess");
      socket.off("roomClosed");
      socket.off("leaveRoomSuccess");
      socket.off("addSongToWaitingListFailed");
      socket.off("addSongToWaitingListSuccess");
      socket.off("updateWaitingList");
      socket.off("updateListSong");
      socket.off("playSong");
      socket.off("animation");

    };
  }, [router, socket]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
  };

  const handleCloseSearch = () => {
    setSearchTerm("");
    setFilteredSongs([]);
  };

  const handleAddSong = (song: DataSong) => {
    console.log("song: ", song);
    socket?.emit("addSongToWaitingList", song);
  };
  const handlePlaySong = (song: DataSong) => {
    // setCurrentSongId(song.id);
    if (permit) {
      socket?.emit("selectSongToPlay", song.id);
    }
  };

  const handleLeaveRoom = async () => {
    socket?.emit("leaveRoom");
  };

  // const memoizedProposalList = useMemo(() => currentProposalList, [currentProposalList]);
  // const memoizedListUser = useMemo(() => listUser, [listUser]);

  const MemoizedProposalList = useMemo(
    () => (
      <ProposalList currentProposalList={currentProposalList} permit={permit} />
    ),
    [currentProposalList, permit]
  );
  const MemoizedListUser = useMemo(
    () => <ListUser listUser={listUser} permit={permit} />,
    [listUser, permit]
  );
  return (
    <div className="w-full my-20 m-6 p-8 flex flex-col gap-4">
      <div className="w-full flex items-center justify-start">
        <div className="w-2/4 flex items-center justify-between pr-6">
          <p className="text-white/70 truncate">Room ID: {id || ""}</p>
          <button
            onClick={handleLeaveRoom}
            className="p-3 text-textMedium font-bold bg-primaryColorBlueHover flex items-center shrink-0 gap-2 rounded-md shadow-md hover:bg-darkBlueHover transition-all duration-300"
          >
            <ExitIcon className="text-white w-5 h-5 stroke-white" />
            Leave Room
          </button>
        </div>
        <div className="w-1/4"></div>
        <div className="w-1/4 flex gap-2 items-center px-3">
          <button
            onClick={handleViewUser}
            className="p-3 text-textMedium font-bold bg-primaryColorPinkHover flex items-center shrink-0 gap-2 rounded-md shadow-md hover:bg-darkPinkHover transition-all duration-300"
            aria-label={showUsers ? "Hide Participants" : "View Participants"}
          >
            {showUsers ? (
              <>
                Hide <span>{listUser.length}</span> Participants
                <ChevronUpIcon className="text-white w-5 h-5 stroke-white" />
              </>
            ) : (
              <>
                View <span>{listUser.length}</span> Participants
                <ChevronDownIcon className="text-white w-5 h-5 stroke-white" />
              </>
            )}
          </button>
        </div>
      </div>
      <div className="w-full flex gap-6 ">
        {/* player */}
        <div className="w-2/4 h-screen flex flex-col gap-2">
          {/* <SongPlayedBanner id={currentSongId} playlist={playlist} /> */}
          {currentSong && (
            <SongPlayedBanner2
              currentSong={currentSong}
              playlist={waitingSongs}
              permit={permit}
            />
          )}
          {/* list chat */}
          <ChatMessage myId={myId} />
        </div>

        <div className="w-1/4 h-screen flex flex-col gap-6 relative bg-secondColorBg rounded-lg">
          {/* Search */}
          <div className="absolute top-0 left-0 w-full h-full z-10 p-4 rounded-lg">
            <div className="flex flex-col h-full">
              {permit && (
                <div>
                  <p className="font-bold text-ml mb-3 text-white mr-2">
                    Let&apos;s find content for your stream playlist{" "}
                  </p>
                  <div className="flex items-center bg-[#2C2C2C] w-full p-2 gap-2 rounded-md mb-3">
                    <IoSearch className="text-[1.2rem]" />
                    <input
                      type="text"
                      placeholder="Find songs"
                      className="focus:outline-none placeholder:text-[0.9rem] placeholder:text-primaryColorGray text-primaryColorGray text-[0.9rem] bg-transparent w-full"
                      value={searchTerm}
                      onChange={handleSearch}
                      maxLength={150}
                    />
                  </div>
                </div>
              )}
              {/* Search Results */}
              {filteredSongs.length > 0 ? (
                <div className="w-full overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
                  <span>
                    <button
                      className="absolute top-5 right-2 text-white"
                      onClick={handleCloseSearch}
                    >
                      <Cross2Icon className="h-5 w-5 hover:text-primaryColorPinkHover" />
                    </button>
                  </span>
                  <table className="w-full text-white border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        <th className="w-[75%] pl-4"></th>
                        <th className="w-[25%] pl-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSongs.map((song, index) => (
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
                              <p className="font-bold text-white truncate text-ellipsis">
                                {song.title}
                              </p>
                              <p className="font-thin text-primaryColorGray text-[0.9rem] truncate text-ellipsis">
                                {getMainArtistInfo(song.artists)?.name}
                              </p>
                            </div>
                          </td>
                          <td>
                            <button
                              className="px-4 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300"
                              onClick={() => handleAddSong(song)}
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // waiting songs
                <div className="w-full flex flex-col bg-secondColorBg flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
                  <p className="font-bold text-ml my-3 text-primaryColorPinkHover">
                    Waiting song for your stream room
                  </p>
                  <div className="w-full flex ">
                    <ul className="list-none w-full">
                      {waitingSongs?.map((song: DataSong, index) => {
                        const isCurrentSong = currentSong?.song?.id === song.id;
                        console.log("isCurrentSong: ", isCurrentSong);
                        console.log("currentSong: ", currentSong);
                        return (
                          <li
                            key={index}
                            className="flex items-center gap-3 mb-3"
                            // style={{
                            //   backgroundColor:
                            //     song?.id === currentSong?.song.id
                            //       ? "red"
                            //       : "transparent",
                            // }}
                          >
                            <Image
                              src={getPosterSong(song.album).image}
                              alt="Song Poster"
                              width={48}
                              height={48}
                              quality={100}
                              className="object-cover rounded-md w-10 h-10"
                            />
                            <div className="w-full flex justify-between items-center">
                              <div>
                                <p className="font-bold text-white truncate">
                                  {song.title}
                                </p>
                                <p className="font-thin text-primaryColorGray text-[0.9rem] truncate">
                                  {getMainArtistInfo(song.artists)?.name}
                                </p>
                              </div>
                              {isCurrentSong ? (
                                <div className="absolute right-3">
                                  <Lottie
                                    loop
                                    animationData={animation}
                                    play={enableAnimation}
                                    style={{ width: 24, height: 24 }}
                                    className="text-primaryColorPink"
                                  />
                                </div>
                              ) : (
                                permit && (
                                  <button
                                    className="h-8 px-4 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300"
                                    onClick={() => handlePlaySong(song)}
                                  >
                                    Play
                                  </button>
                                )
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* {showUsers ? (
          <ListUser listUser={memoizedListUser} permit = {permit}/>
        ) : (
          <ProposalList
            currentProposalList={memoizedProposalList}
            permit={permit}
          />
        )} */}
          <div className="w-1/4 h-screen flex flex-col gap-6 relative bg-secondColorBg rounded-lg" style={{ display: showUsers ? "none" : "block" }}>
            {MemoizedProposalList}
          </div>
          <div className="w-1/4 h-screen flex flex-col gap-6 relative bg-secondColorBg rounded-lg"
          style={{ display: showUsers ? "block" : "none" }}>
            {MemoizedListUser}
          </div>
      </div>
    </div>
  );
}

export default Page;
