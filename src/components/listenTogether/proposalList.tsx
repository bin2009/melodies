"use client";

import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
import { useAppContext } from "@/app/AppProvider";
import { fetchApiData } from "@/app/api/appService";
import { DataSong } from "@/types/interfaces";
import Image from "next/image";
import { getMainArtistInfo, getPosterSong } from "@/utils/utils";
import { IoSearch } from "react-icons/io5";
import { useToast } from "@/hooks/use-toast";

function ProposalList({
  currentProposalList,
  permit,
}: {
  currentProposalList: DataSong[];
  permit: boolean;
}) {
  const { socket } = useAppContext();
  const { accessToken } = useAppContext();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<DataSong[]>([]);
  // const [proposalSongs, setProposalSongs] = useState([]);
  const [proposalList, setProposalList] = useState<DataSong[]>([]);


  console.log("proposalList: ", proposalList);
  useEffect(() => {
    setProposalList(currentProposalList);
  }, [currentProposalList]);

  useEffect(() => {
    if (!socket) return;

    socket.on("addSongToProposalListSuccess", () => {
      // alert("them bai playlist wait ok");
      toast({
        title: "Success",
        description: "Add song to proposal list success",
        variant: "success",
      });
    });
    socket.on("updateProposalList", (proposalList) => {
      setProposalList(proposalList);
    });
    socket.on("updateListSong", (data) => {
      setProposalList(data.proposalList);
    })
    socket.on("addSongToProposalListFailed", (data) => {
      toast({
        title: "Error",
        description: `Add song to proposal list failed. "${data}"`,
        variant: "destructive",
      });

      // alert(data)
    })
    socket.on("forwardSongFailed", (data) => {
      toast({
        title: "Error",
        description: `Forward song to waiting list failed. "${data}"`,
        variant: "destructive",
      });
      // alert(data)
    })

    return () => {
      socket?.off("addSongToProposalListSuccess");
      socket?.off("updateProposalList");
      socket?.off("updateListSong");
      socket?.off("addSongToProposalListFailed");
      socket?.off("forwardSongFailed");
    }
  }, [socket]);
  // }, []);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
  };

  const handleCloseSearch = () => {
    setSearchTerm("");
    setFilteredSongs([]);
  };

  const handleAddSong = (song) => {
    socket?.emit("addSongToProposalList", song);
  };

  const handleAddSongPlaylist = (song) => {
    console.log("song: ", song.id);
    socket?.emit("forwardSong", song.id)
  };

  return (
    <div className="">
      {/* Search */}
      <div className="absolute top-0 left-0 w-full h-full z-10 p-4 rounded-lg">
        <div className="flex flex-col h-full w-full">
          {!permit && (

          <div>
          <p className="font-bold text-ml mb-3 text-white mr-2">
            Let&apos;s find content for your recommend{" "}
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
              <table className="flex-1 text-white border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="w-[75%]"></th>
                    <th className="w-[25%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song, index) => (
                    <tr key={index}>
                      <td className="group flex max-w-[75%]">
                        <Image
                          src={getPosterSong(song.album).image}
                          alt="Song Poster"
                          width={48}
                          height={48}
                          quality={100}
                          className="object-cover rounded-md w-10 h-10"
                        />
                        <div className="ml-2 flex flex-col w-3/4">
                          <p className="font-bold text-textMedium text-white truncate">
                            {song.title}
                          </p>
                          <p className="font-thin text-primaryColorGray text-[0.9rem] truncate">
                            {getMainArtistInfo(song.artists)?.name}
                          </p>
                        </div>
                      </td>
                      <td className="max-w-[25%]">
                        <button
                          className="px-3 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-black hover:bg-white transition-all duration-300"
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
            <div className="w-full flex flex-col bg-secondColorBg flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
              <p className="font-bold text-ml my-3 text-primaryColorPinkHover">
                Proposal song for host
              </p>
              <div className="w-full flex ">
                <ul className="list-none w-full">
                  {proposalList?.map((song, index) => (
                    <li key={index} className="flex items-center gap-3 mb-3">
                      <Image
                        src={getPosterSong(song.album).image}
                        alt="Song Poster"
                        width={48}
                        height={48}
                        quality={100}
                        className="object-cover rounded-md w-10 h-10"
                      />
                      <div className="w-full flex justify-between">
                        <div className="flex flex-col w-full">
                          <p className="font-bold text-white truncate">
                            {song.title}
                          </p>
                          <p className="font-thin text-primaryColorGray text-[0.9rem] truncate">
                            {getMainArtistInfo(song.artists)?.name}
                          </p>
                        </div>
                        { permit && (

                          <button
                          className="h-8 px-2 py-1 border-white border-2 text-[0.8rem] text-white font-bold rounded-full hover:text-primaryColorPink hover:bg-white transition-all duration-300"
                          onClick={() => handleAddSongPlaylist(song)}
                          >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        )}
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
  );
}

export default ProposalList;
