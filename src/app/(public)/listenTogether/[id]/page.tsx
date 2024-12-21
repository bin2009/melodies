"use client";
import {
  PlusIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAppContext } from "@/app/AppProvider";
import LoadingPage from "@/components/loadingPage";
import { fetchApiData } from "@/app/api/appService";
import { DataCurrentSong, DataSong, UserRoom } from "@/types/interfaces";
import Image from "next/image";
import { getMainArtistName, getPosterSong } from "@/utils/utils";
import { IoSearch } from "react-icons/io5";
import ChatMessage from "@/components/listenTogether/chatMessage";
import ProposalList from "@/components/listenTogether/proposalList";
import { useToast } from "@/hooks/use-toast";
import SongPlayedBanner2 from "@/components/listenTogether/songPlayerBanner2";
import ListUser from "@/components/listenTogether/listUser";
import animation from "../../../../../public/animation/Animation - song.json";
import Lottie from "react-lottie-player";
import { useRouter } from "next/navigation";

// let socket: Socket | null = null;

function Page({params}) {
  const { id } = params;
  const { socket } = useAppContext();
  const { accessToken } = useAppContext();
  const [roomId, setRoomId] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [permit, setPermit] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<DataSong[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  // check
  const [currentProposalList, setCurrentProposalList] = useState([]);
  const [waitingSongs, setWaitingSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState<DataCurrentSong | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [listUser, setListUser] = useState<UserRoom[]>([]);
  const [enableAnimation, setEnableAnimation] = useState(true);
  const [myId, setMyId] = useState<string>("");

  useEffect(() => {
    socket?.emit("getData");
  }, [])

  const handleTimeUpdate = () => {
    if (audioRef.current && permit) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
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

    socket.on("addSongToListWaitSuccess", () => {
      alert("them bai playlist wait ok");
    });
    socket.on("updateListSongWait", (listWait) => {
      // console.log("list wait: ", listWait);
      setWaitingSongs(listWait);
    });

    socket.on("addSongToListPlaySuccess", () => {
      alert("them bai playlist play ok");
    });

    socket.on("updateListSongPlay", (listPlay) => {
      console.log("list play: ", listPlay);
      setPlaylist(listPlay);
    });
    socket.on("addSongToWaitingListSuccess", () => {
      alert("them bai playlist ok");
    });
    socket.on("addSongToWaitingListFailed", (data) => {
      alert(data);
    });
    socket.on("updateWaitingList", (waitingList) => {
      // console.log("list wait: ", waitingList);
      setWaitingSongs(waitingList);
    });
    socket.on("updateListSong", (data) => {
      // console.log("list wait: ", data.waitingList);
      setWaitingSongs(data.waitingList);
    });
    socket.on("playSong", (currentSong) => {
      setCurrentSong(currentSong);
    });
    socket.on("members", (data) => {
      console.log("members: ", data)
      setListUser(data);
    })
    socket.on("roomData", (data) => {
      console.log("nhaanj room data")
      setPermit(data.permit);
      setWaitingSongs(data.waitingList);
      setCurrentProposalList(data.proposalList);
      setCurrentSong(data.currentSong);
      // if (data.currentSong) {
      //   console.log("room data: ", data.currentSong.song)
      // } else {
      //   console.log("room data empty: ", )
      // }
    })
    socket.on("disconnect", () => {
      alert("Lost connection to server")
      router.push(`/listenTogether`);
    })
    socket.on("roomClosed", (data) => {
      console.log(data)
      alert(data);
      router.back();
    })
    socket.on("leaveRoomSuccess", () => {
      alert("Leave room success");
      console.log("Leave room success");
      router.push(`/listenTogether`);
    });
    socket.on("members", (data) => {
      console.log("members: ", data)
      setListUser(data);
    })

    socket.on("roomData", (data) => {
      setPermit(data.permit);
      setWaitingSongs(data.waitingList);
      setCurrentProposalList(data.proposalList);
      setCurrentSong(data.currentSong);
    })
    socket.on("animation", (data) => {
      setEnableAnimation(data)
    })
    socket.on("myId", (data) => {
      console.log("id haha: ", data)
      setMyId(data)
    })

    return () => {
      socket.off("addSongToListWaitSuccess");
      socket.off("updateListSongWait");
      socket.off("addSongToListPlaySuccess");
      socket.off("updateListSongPlay");
      socket.off("addSongToWaitingListSuccess");
      socket.off("addSongToWaitingListFailed");
      socket.off("updateWaitingList");
      socket.off("updateListSong");
      socket.off("playSong");
      socket.off("roomClosed");
      socket.off("leaveRoomSuccess");
      socket.off("members");
      socket.off("roomData");
      socket.off("myId");
    };
  }, [socket]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
  };

  const handleCloseSearch = () => {
    setSearchTerm("");
    setFilteredSongs([]);
  };

  const handleAddSong = (song) => {
    console.log("song: ", song);
    socket?.emit("addSongToWaitingList", song);
  };
  const handlePlaySong = (song) => {
    // setCurrentSongId(song.id);
    if (permit) {
      socket?.emit("selectSongToPlay", song.id);
    }
  };

  const handleLeaveRoom = async () => {
    socket?.emit("leaveRoom");
  };

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
                <ChevronUpIcon className="text-white w-5 h-5 stroke-white"/>
              </>
            ) : (
              <>
                View <span>{listUser.length}</span> Participants
                <ChevronDownIcon className="text-white w-5 h-5 stroke-white"/>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="w-full flex gap-6 ">
        {/* player */}
        <div className="w-2/4 h-screen flex flex-col gap-2">
          {/* <SongPlayedBanner id={currentSongId} playlist={playlist} /> */}
          <SongPlayedBanner2
            currentSong={currentSong}
            playlist={waitingSongs}
            permit={permit}
          />
          {/* list chat */}
          <ChatMessage myId={myId}/>
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
                                {getMainArtistName(song.artists)}
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
                      {waitingSongs?.map((song, index) => {
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
                                  {getMainArtistName(song.artists)}
                                </p>
                              </div>
                              {(isCurrentSong && enableAnimation) ? (
                                <div className="absolute right-3">
                                  <Lottie
                                    loop
                                    animationData={animation}
                                    play={currentSong?.isPlaying}
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
        {showUsers ? (
          <ListUser listUser={listUser} />
        ) : (
          <ProposalList
            socket={socket}
            currentProposalList={currentProposalList}
            permit={permit}
          />
        )}
      </div>
    </div>
  );
}

export default Page;