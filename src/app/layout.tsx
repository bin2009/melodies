import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SongProvider } from "@/components/provider/songProvider";
import { ScrollProvider } from "@/components/provider/scrollProvider";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/app/AppProvider";
import { ArtistProvider } from "@/components/provider/artistProvider";
import { GenreProvider } from "@/components/provider/genreProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Melodies",
  description: "Melodies",
  icons: {
    icon: "/key-sol.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primaryColorBg flex overflow-hidden text-white`}
      >
        <AppProvider>
          <Toaster />
          <ScrollProvider>
            <SongProvider>
              <ArtistProvider>
                <GenreProvider>
                  <main className="">{children}</main>
                </GenreProvider>
              </ArtistProvider>
            </SongProvider>
          </ScrollProvider>
        </AppProvider>
      </body>
    </html>
  );
}
