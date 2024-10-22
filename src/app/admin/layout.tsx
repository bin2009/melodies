'use client'
import React from "react";
import MusicPlayer from "@/components/musicPlayer";
import ScrollContent from "@/components/scrollContent";
import SongIntroduce from "@/components/songIntroduce";
import WaitingList from "@/components/waitingList";
import { ToastProvider } from "@/components/ui/toast";
import Header from "@/app/layout/header/Header";
import Footer from "@/app/layout/footer/Footer";
import ScrollButton from "@/app/layout/scrollButton/ScrollButton";
import SidebarAdmin from "@/app/layout/sidebar/SidebarAdmin";
import { useAppContext } from "@/app/AppProvider";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { role } = useAppContext();
  return (
    <div className="flex">
      {
        role && role === 'Admin' ? (
          <div>
            <SidebarAdmin />
            <ScrollContent>
              <div className="ml-[16.66vw]">
                <main className="flex flex-col items-center">
                  <Header />
                  {children}
                  <ToastProvider />
                  <Footer />
                </main>
              </div>
            </ScrollContent>
            <SongIntroduce />
            <WaitingList />
            <MusicPlayer />
            <ScrollButton />
          </div>
        ) : (
          <p>404 </p>
        )
      }

    </div>
  );
};

export default AdminLayout;
