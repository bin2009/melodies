"use client";
import { PlusIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { PaperPlaneIcon, Cross2Icon } from "@radix-ui/react-icons";
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
import SongPlayedBanner from "@/components/songPlayedBanner";
import SongPlayedBanner2 from "@/components/songPlayedBanner2";

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
    { user: string; message: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [filteredSongs, setFilteredSongs] = useState<DataSong[]>([]);
  const [waitingSongs, setWaitingSongs] = useState([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState<object>({});

  const [currentSongId, setCurrentSongId] = useState<string>("");

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
    // Khởi tạo socket
    // socket = io("https://1vtglwl3-20099.asse.devtunnels.ms");

    // socket.on("connect", () => {
    //   console.log("Đã kết nối tới server:", socket?.id);
    // });
    if (!socket) return;

    // socket.emit("JoinRoom", { roomId: "someRoomId" });
    socket.emit("Error", (message) => {
      console.log("Error:", message);
    });
    socket.on("CreateRoomSuccess", (id) => {
      console.log("Đã kết nối tới room:", id);
    });

    socket.on("JoinRoomSuccess", (data) => {
      console.log("Join Success to room:", data);
      setPermit(data.permit);
    });

    socket.on("Users", (id) => {
      console.log("Userid:", id);
    });

    // socket.on("PermissionUpdateFail", (status) => {
    //   setPermit(status);
    //   console.log("Permission update fail:", status); // Ghi log giá trị status
    // });

    socket.on("UpdateAudio", (data) => {
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

    socket.on("ServerSendMessage", (data) => {
      console.log("Message:", data);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { user: data.user.username, message: data.message },
      ]);
    });

    socket.on("addSongToListWaitSuccess", () => {
      alert("them bai playlist wait ok");
    });

    socket.on("updateListSongWait", (listWait) => {
      console.log("list wait: ", listWait);
      setWaitingSongs(listWait);
    });
   
    socket.on("addSongToListPlaySuccess", () => {
      alert("them bai playlist play ok");
    });

    socket.on("updateListSongPlay", (listPlay) => {
      console.log("list play: ", listPlay);
      setPlaylist(listPlay);
    });

    socket.on("playSong", (currentSong) => {
      setCurrentSong(currentSong);
    })

    return () => {
      socket?.disconnect();
      console.log("Đã ngắt kết nối socket");
    };
  }, [socket]);

  const handleJoinRoom = async () => {
    socket?.emit("joinRoom", roomId);
    socket?.on("joinRoomSuccess", (data) => {
      console.log("Join Success to room:", data.roomId);
      setPermit(data.permit);
      setWaitingSongs(data.listWait)
      setPlaylist(data.listPlay)
      // setVisible(true);
    });
    socket?.on("joinRoomFailed", (data) => {
      console.log("joinRoomFailed", data);
    });
  };

  // const handleCreateRoom = async () => {
  //   socket?.emit("createRoom", { accessToken: accessToken, data: "a" });
  //   try {
  //     console.log("Kết quả từ API:", "response");
  //   } catch (error) {
  //     console.error("Lỗi khi tạo phòng:", error);
  //     alert("Không thể tạo phòng. Vui lòng thử lại.");
  //   }
  // };

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
    const query = e.target.value;
    setSearchTerm(query);
  };

  const handleCloseSearch = () => {
    setSearchTerm("");
    setFilteredSongs([]);
  };

  const handleCreateRoom = async () => {
    socket?.emit("createRoom");
    socket?.on("createRoomSuccess", (id) => {
      console.log("Create room success: " + id);
      // setVisible(true);
    });
    socket?.on("createRoomFailed", (data) => {
      console.log("createRoomFailed", data);
    });
  };

  const handleAddSong = (song) => {
    console.log("song: ", song);
    // socket?.emit("addSongToListWait", song);
    socket?.emit("addSongToListPlay", song);



    // // Kiểm tra xem bài hát đã tồn tại trong playlist chưa
    // if (!playlist.includes(song.id)) {
    //   // Thêm ID của bài hát vào playlist
    //   setPlaylist([...playlist, song.id]);
    // }
    // if (!waitingSongs.some((waitingSong) => waitingSong.id === song.id)) {
    //   setWaitingSongs([...waitingSongs, song]);
    // }
  };

  const handleLeaveRoom = async () => {
    socket?.emit("leaveRoom");
    socket?.on("leaveRoomSuccess", () => {
      console.log("Leave room success");
      // setVisible(false);
    });
  };

  const handlePlaySong = (song) => {
    console.log("select song: ", song)
    // Cập nhật currentSongId khi người dùng nhấn Play
    socket?.emit("selectSongToPlay", song.id);
    // setCurrentSongId(song.id);
  };

  return (
    <div className="w-full my-20 m-6 p-8 flex-col gap-4">
      <div className="w-full flex gap-2 jutify-between mb-4">
        <button
          onClick={handleCreateRoom}
          className="p-2 text-textMedium bg-primaryColorPink flex items-center shrink-0 gap-2 rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
        >
          <PlusIcon className="text-white w-5 h-5" />
          Create a room
        </button>
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
      <div className="w-full flex gap-6 ">
        {/* player */}
        <div className="w-2/4 h-screen flex flex-col gap-2">
          {/* <SongPlayedBanner id={currentSongId} playlist={playlist} /> */}
          <SongPlayedBanner2 currentSong={currentSong} playlist={playlist} />
          {/* list chat */}
          <div className="w-full flex-grow text-black flex flex-col gap-4 p-4 bg-secondColorBg rounded-lg">
            <div className="w-full flex gap-4">
              <Input
                placeholder="enter message"
                className="text-black border-primaryColorBlue h-10"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></Input>
              <button
                onClick={handleSentMessage}
                className="h-10 w-10 p-2 text-textMedium bg-primaryColorPink rounded-md shadow-sm shadow-white/60 hover:bg-darkPinkHover"
              >
                <PaperPlaneIcon className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="w-full border border-primaryColorBlue">
              {chatMessages.map((msg, index) => (
                <div key={index}>
                  <p>{msg.user}</p>
                  <h3>{msg.message}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/4 h-screen flex flex-col gap-6 relative bg-secondColorBg rounded-lg">
          {/* Search */}
          <div className="absolute top-0 left-0 w-full h-full z-10 p-4 rounded-lg">
            <div className="flex flex-col h-full">
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
                      {playlist.map((song, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 mb-3"
                        >
                          <Image
                            src={getPosterSong(song.album).image}
                            alt="Song Poster"
                            width={48}
                            height={48}
                            quality={100}
                            className="object-cover rounded-md w-10 h-10"
                          />
                          <div className="w-full flex justify-between">
                            <div>
                              <p className="font-bold text-white truncate text-ellipsis">
                                {song.title}
                              </p>
                              <p className="font-thin text-primaryColorGray text-[0.9rem] truncate text-ellipsis">
                                {getMainArtistName(song.artists)}
                              </p>
                            </div>
                            <button
                              className="h-8 px-4 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300"
                              onClick={() => handlePlaySong(song)}
                            >
                              Play
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* proposal */}
        <div className="w-1/4 h-screen flex flex-col gap-4">
          <div>
            <p className="font-bold text-ml text-primaryColorPinkHover">
              Proposal song for your stream room
            </p>
          </div>
          <div className="w-full overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black bg-secondColorBg p-2 rounded-lg">
            <ul className="list-none">
              {waitingSongs.map((song, index) => (
                <li key={index} className="flex items-center gap-3 mb-3">
                  <Image
                    src={getPosterSong(song.album).image}
                    alt="Song Poster"
                    width={48}
                    height={48}
                    quality={100}
                    className="object-cover rounded-md w-10 h-10"
                  />
                  <div>
                    <p className="font-bold text-white">{song.title}</p>
                    <p className="font-thin text-primaryColorGray text-[0.9rem]">
                      {getMainArtistName(song.artists)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
