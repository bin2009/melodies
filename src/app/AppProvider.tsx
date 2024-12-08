'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';
interface AppContextType {
    showPlaylistMenu: boolean,
    setShowPlaylistMenu: (show: boolean) => void
    search: string,
    setSearch: (search: string) => void
    loading: boolean,
    setLoading: (loading: boolean) => void
    role: string | null,
    setRole: (role: string) => void;
    accessToken: string | null,
    setAccessToken: (token: string) => void
    socket: Socket | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within a SongProvider");
    }
    return context;
};

export const AppProvider: React.FC<{
    children: ReactNode
    initialAccessToken?: string
    initialRole?: string
    initialId?: string
}> = ({
    children,
    initialAccessToken = '',
    initialRole = ''
}) => {
        const [loading, setLoading] = useState<boolean>(false)
        const [showPlaylistMenu, setShowPlaylistMenu] = useState<boolean>(false)
        const [search, setSearch] = useState<string>('')
        const [role, setRole] = useState<string>(() => {
            return typeof window !== "undefined" ? Cookies.get('role') || "" : initialRole;
        });

        const [accessToken, setAccessToken] = useState<string>(() => {
            return typeof window !== "undefined" ? Cookies.get('accessToken') || "" : initialAccessToken;
        });

        const [socket, setSocket] = useState<Socket | null>(null);

        useEffect(() => {
            if (accessToken && role) {
                Cookies.set('role', role, { expires: 7 }); // Expire in 7 days
                Cookies.set('accessToken', accessToken, { expires: 7 }); // Expire in 7 days
            } else {
                Cookies.remove('accessToken');
                Cookies.remove('role');
            }
        }, [accessToken, role]);

        useEffect(() => {
            if (accessToken) {
              const newSocket = io("http://localhost:20099", {
                auth: { accessToken: accessToken },
              });

            //   const socket = io('http://your-socket-server.com', {
            //     auth: {
            //         accessToken: yourAccessToken, // Gửi accessToken
            //     },
            // });
        
            //   newSocket.on("connect", () => {
            //     console.log("Socket connected:", newSocket.id);
            //   });
            newSocket.on("errorToken", ({ code, message }) => {
                console.log("Error accesstoken code: ", code);
                console.log("Error accesstoken message: ", message);
                alert(message);
                newSocket.disconnect();
              });
              

              newSocket.on('paymentStatus', (data) =>{
                console.log("payment", data);
              })
        
              setSocket(newSocket);
        
              // Cleanup on Unmount or Token Change
              return () => {
                newSocket.disconnect();
                setSocket(null);
              };
            }
          }, [accessToken]);

        const value = {
            showPlaylistMenu,
            setShowPlaylistMenu,
            search,
            setSearch,
            loading,
            setLoading,
            role,
            setRole,
            accessToken,
            setAccessToken,
            socket,
        };
        return (
            <AppContext.Provider value={value}>
                {children}
            </AppContext.Provider>
        );
    };
