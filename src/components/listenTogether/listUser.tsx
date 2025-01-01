import React, { useEffect, useState } from "react";
import Image from "next/image";
import songimg from "@/assets/img/songs.png";
import { UserRoom } from "@/types/interfaces";


function ListUser({ listUser, permit }: { listUser: UserRoom[], permit: boolean }) {
  const [users, setUsers] = useState<UserRoom[]>(listUser);
  useEffect(() => {
    setUsers(listUser);
    console.log("listUser", listUser);
    console.log("permit", permit);
  }, [listUser, permit]);
  return (
    <div className="">
      {users.length > 0 ? (
        <div className="w-full flex flex-col gap-4 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-darkBlue scrollbar-track-black">
          {users.map((item, index) => (
            
            <div key={index} className="flex gap-2 items-center" 
            >
              <Image
                src={songimg}
                alt="song"
                width={36}
                height={36}
                className="rounded-full"
              />
              <h4 className="font-bold mb-1 hover:underline line-clamp-1 text-white/80 truncate">
                {item.username}
                {item.host && <span className="ml-2 p-1 text-white bg-primaryColorBlueHover text-sm font-normal rounded-xl">host</span>}
              </h4>

            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="p-2">No user</p>
        </div>
      )}
    </div>
  );
}

export default ListUser;
