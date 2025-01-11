'use client'
import { useEffect, useState } from "react";
import { fetchApiData } from "@/app/api/appService";
import { fetchApiData as fetchApiDataRecommend } from "@/app/api/appServiceAI";
import { useAppContext } from "@/app/AppProvider";

import PopularArtists from "@/components/popularArtists";
import SongList from "@/components/listSong";
import TrendingSongs from "@/components/trendingSongs";
import LoadingPage from "@/components/loadingPage";

export default function Discover() {
    const { loading, setLoading, accessToken } = useAppContext();
    const [recommend, setRecentCommend] = useState()
    const [weekSong, setWeekSong] = useState()
    const [newReleaseSong, setNewReleaseSong] = useState()
    const [trendSong, setTrendSong] = useState()
    const [popularArtist, setPopularArtist] = useState()
    useEffect(() => {
        const fetchSong = async () => {
            setLoading(true);
            try {
                const responses = await Promise.all([
                    fetchApiData("/api/songs/weeklytopsongs", "GET", null, null, { page: 1 }),
                    fetchApiData("/api/songs/newRaleaseSong", "GET", null, null, { page: 1 }),
                    fetchApiData("/api/songs/trending", "GET", null, null, { page: 1 }),
                    fetchApiData("/api/artist/popular", "GET", null, null, { page: 1 }),
                ]);
                if (responses[0].success) setWeekSong(responses[0].data.weeklyTopSongs);
                if (responses[1].success) setNewReleaseSong(responses[1].data.newReleaseSongs);
                if (responses[2].success) setTrendSong(responses[2].data.trendingSongs);
                if (responses[3].success) setPopularArtist(responses[3].data.popularArtist);
            } catch (error) {
                console.error("Error fetching songs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSong();
    }, []);

    useEffect(() => {
        if (accessToken) {
            const fetchRecommendations = async () => {
                const recommendResponse = await fetchApiDataRecommend("/recommend", "GET", null, accessToken, { page: 1 });
                if (recommendResponse.success) {
                    setRecentCommend(recommendResponse.data.songs);
                }
            };
            fetchRecommendations();
        }
    }, [accessToken]);

    if (loading) return <LoadingPage />
    return (
        <div className="flex flex-col gap-5 mb-20 relative pt-24">
            <div className="">
                <SongList maintitle="Weekly Top" subtitle="Songs" data={weekSong} />
            </div>
            <div className="mt-4">
                <SongList maintitle="New Releases" subtitle="Songs" data={newReleaseSong} />
            </div>
            <div className="">
                <TrendingSongs maintitle="Trending" subtitle="Songs" data={trendSong} />
            </div>
            <div className="">
                <PopularArtists maintitle="Popular" subtitle="Artists" data={popularArtist} />
            </div>
            {
                accessToken && recommend && (
                    <div className="">
                        <SongList maintitle="Recommend" subtitle="Songs" data={recommend} />
                    </div>
                )
            }
        </div>
    );
}
