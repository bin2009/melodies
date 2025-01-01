'use client'
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/AppProvider";
import { useAppContext as useSongContext } from "@/components/provider/songProvider";
import { useScrollArea } from "@/components/provider/scrollProvider";
import { fetchApiData } from "@/app/api/appService";
import ArtistBanner from "@/components/artistBanner";
import TrendingSongs from "@/components/trendingSongs";
import LoadingPage from "@/components/loadingPage";
import NotFound from "@/app/not-found";
import AlbumList from "@/components/albumList";
import { Artist } from "@/types/interfaces";
import { IoPlayCircleOutline } from "react-icons/io5";

const Page = ({ params }: { params: { id: string } }) => {
    const { loading, setLoading, accessToken } = useAppContext();
    const { setCurrentSong, setWaitingList, showSidebarRight } = useSongContext()
    const { scrollAreaRef } = useScrollArea();
    const [dataArtist, setDataArtist] = useState<Artist>()
    const [dataSongArtist, setDataSongArtist] = useState()
    const [dataAlbumArtist, setDataAlbumArtist] = useState()
    const [dominantColor, setDominantColor] = useState<string>('rgba(0, 0, 0, 0)');
    const [notFound, setNotFound] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollAreaRef?.current) {
                const scrollTop = scrollAreaRef.current.scrollTop;
                console.log("scrollTop", scrollTop);
                setIsScrolled(scrollTop > 250);
            }
        };
        if (scrollAreaRef?.current) {
            scrollAreaRef.current.addEventListener("scroll", handleScroll);
            return () => {
                if (scrollAreaRef.current) {
                    scrollAreaRef.current.removeEventListener("scroll", handleScroll);
                }
            };
        }
    }, [scrollAreaRef]);

    useEffect(() => {
        const fetchArtist = async () => {
            setLoading(true);
            try {
                const responses = await Promise.all([
                    fetchApiData(`/api/artist/${params.id}`, "GET", null, accessToken),
                    fetchApiData(`/api/artist/popSong/${params.id}`, "GET", null, null, { page: 1 }),
                    fetchApiData(`/api/artist/album/${params.id}`, "GET", null, null, { page: 1 }),
                ]);
                if (responses[0].success) {
                    setDataArtist(responses[0].data.artist)
                    const imageUrl = responses[0].data.artist.avatar
                    try {
                        const response = await fetch(
                            `/api/get-dominant-color?imageUrl=${encodeURIComponent(imageUrl)}`
                        );
                        console.log("API response:", response);
                        const data = await response.json();
                        if (response.ok) {
                            console.log("Dominant color:", data.dominantColor);
                            setDominantColor(data.dominantColor)
                        }
                    } catch (error) {
                        console.error("Error fetching dominant color:", error);
                    }
                }
                if (responses[1].success) {
                    setDataSongArtist(responses[1].data.popSong)
                }
                if (responses[2].success) {
                    setDataAlbumArtist(responses[2].data.artistAlbum)
                }
            } catch (error) {
                console.error("Error fetching songs:", error);
                setNotFound(true)
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [params.id]);

    if (loading) return <LoadingPage />
    if (notFound) return <NotFound />;
    return (
        <div className="w-full bg-secondColorBg flex flex-col">
            <div
                className="m-3 rounded-2xl border-2 border-primaryColorBg bg-gradient-to-b to bg-primaryColorBg overflow-auto pb-5"
                style={{
                    background: `linear-gradient(to bottom, ${dominantColor} 20%, rgba(0, 0, 0, 0.8) 80%)`,
                }}
            >
                <div className={`mb-4 transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"}`}>
                    <ArtistBanner data={dataArtist} color={dominantColor} />
                </div>
                <div
                    className={`flex items-center gap-2 fixed top-24 pl-8 font-bold text-2xl py-4 transition-transform duration-300
                        ${isScrolled ? "translate-y-0" : "-translate-y-full opacity-0"} ${showSidebarRight ? 'w-[61%]' : 'w-[81%]'}`}
                    style={{
                        backgroundColor: isScrolled ? "#1F1F1F" : "transparent",
                    }}
                >
                    <IoPlayCircleOutline
                        className="w-12 h-12 text-white cursor-pointer"
                        onClick={() => { if (dataSongArtist) { setCurrentSong(dataSongArtist[0]); setWaitingList(dataSongArtist); } }}
                    />
                    {dataArtist?.name}
                </div>
                <div className="mx-8">
                    <TrendingSongs maintitle='Popular' data={dataSongArtist} />
                </div>
                <div className="mb-4 mx-8">
                    <AlbumList maintitle="Artist's" subtitle="Albums" data={dataAlbumArtist} />
                </div>
            </div>

        </div>
    );
};

export default Page;
