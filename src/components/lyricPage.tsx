'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useAppContext as useSongContext } from '@/components/provider/songProvider'
import { getMainArtistInfo, getPosterSong } from '@/utils/utils'
import '@/components/scss/lyricPage.scss'
import { useAppContext } from '@/app/AppProvider'
import LoadingPage from '@/components/loadingPage'

const LyricPage = () => {
    const { loading, setLoading } = useAppContext()
    const { showLyricPage, currentSong, startTime, setStartTime } = useSongContext()
    const [dominantColor, setDominantColor] = useState<string>();
    const [lyricsRealtime, setLyricsRealtime] = useState<Array<{ startTimeMs: string; words: string }> | null>(null);
    const [lyrics, setLyrics] = useState()
    const lyricsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBg = async () => {
            setLoading(true)
            if (currentSong?.album) {
                try {
                    const response = await fetch(
                        `/api/get-dominant-color?imageUrl=${getPosterSong(currentSong.album).image}`
                    );
                    console.log("API response:", response);
                    const data = await response.json();
                    if (response.ok) {
                        console.log("Dominant color:", data.dominantColor);
                        setDominantColor(data.dominantColor);
                    } else {
                        console.error("Error fetching dominant color:", data.error);
                    }
                } catch (error) {
                    console.error("Error fetching dominant color:", error);
                }
            } else {
                setDominantColor('#595959')
            }
            setLoading(false)
        }
        fetchBg()
    }, [currentSong])


    useEffect(() => {
        if (currentSong?.lyric) {
            const fetchLyrics = async () => {
                try {
                    // const response = await fetch('/lyric/NangThoLyric.json');
                    const response = await fetch(currentSong?.lyric);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setLyricsRealtime(data)
                } catch (error) {
                    console.error('Error fetching lyrics:', error);
                }
            };
            fetchLyrics();
        } else {
            const fetchLyrics = async () => {
                try {
                    const response = await fetch('/api/getLyrics', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ title: currentSong?.title, artist: currentSong?.artists ? getMainArtistInfo(currentSong.artists)?.name : '' }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setLyrics(data.lyrics);
                    } else {
                    }
                } catch (err) {
                    console.error('Fetch error:', err);
                }
            };
            fetchLyrics();
        }
    }, [currentSong]);

    const handleLyricClick = (time: number) => {
        const event = new CustomEvent('lyricClick', { detail: { startTime: time } });
        document.dispatchEvent(event);
        setStartTime(time);
    };

    const getCurrentLyricIndex = () => {
        if (!lyricsRealtime) return -1;
        for (let i = 0; i < lyricsRealtime.length; i++) {
            const currentLine = lyricsRealtime[i];
            const nextLine = lyricsRealtime[i + 1];
            const currentStart = parseInt(currentLine.startTimeMs);
            const nextStart = nextLine ? parseInt(nextLine.startTimeMs) : Infinity;

            if (startTime * 1000 >= currentStart && startTime * 1000 < nextStart) {
                return i;
            }
        }
        return -1;
    };
    const currentLyricIndex = getCurrentLyricIndex();

    if (!showLyricPage) return null
    if (loading) return <LoadingPage />
    return (
        <div
            className="absolute top-0 left-0 w-full min-h-screen pb-28"
            style={{ backgroundColor: dominantColor }}
        >
            <div className='w-full h-24 bg-black'>

            </div>
            {
                currentSong?.lyric ? (
                    <div
                        ref={lyricsContainerRef}
                        className="text-center px-4 h-full lyrics-container pt-8"
                    >
                        {lyricsRealtime ? (
                            lyricsRealtime.map((line, index) => {
                                const isPast = startTime * 1000 > parseInt(line.startTimeMs);
                                const isCurrent = currentLyricIndex === index;
                                return (
                                    <p
                                        key={index}
                                        className={`mb-4 transition-all duration-500 cursor-pointer hover:underline
                                    ${isCurrent ? 'text-black font-bold text-[1.3rem] scale-110'
                                                : isPast
                                                    ? 'text-white text-lg opacity-50'
                                                    : 'text-white text-lg'
                                            }`}
                                        onClick={() => handleLyricClick(parseInt(line.startTimeMs) / 1000)}
                                    >
                                        {line.words}
                                    </p>
                                );
                            })
                        ) : (
                            <p>Loading lyrics...</p>
                        )}
                    </div>
                ) : (
                    <pre
                        style={{ whiteSpace: 'pre-wrap' }}
                        className="text-center text-lg"
                    >
                        {lyrics}
                    </pre>
                )
            }


        </div>
    )
}

export default LyricPage