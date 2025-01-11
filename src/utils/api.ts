import { fetchApiData } from "@/app/api/appService";

export const handleFetchPlaylistByUser = async (accessToken: string) => {
    const result = await fetchApiData(
        "/api/user/playlist",
        "GET",
        null,
        accessToken,
        { page: 1 }
    );
    if (result.success) {
        return result.data.playlists
    }
}

export const handleAddToUserPlaylist = async (accessToken: string, songId: string, playlistId: string) => {
    const payload = {
        songId: songId,
        playlistId: playlistId
    }

    const result = await fetchApiData(`/api/user/playlist/addSong`, "POST", JSON.stringify(payload), accessToken);
    return result
}

export const handleAddSongToNewUserPlaylist = async (accessToken: string, songId: string) => {
    const payload = {
        songId: songId,
    }
    const result = await fetchApiData(
        "/api/user/playlist/create",
        "POST",
        JSON.stringify(payload),
        accessToken
    );
    return result
}

export const fetchNotification = async (accessToken: string) => {
    const response = await fetchApiData('/api/user/notifications', 'GET', null, accessToken)
    if (response.success) {
        return { listFetchNotification: response.data.notifications, numberNotification: response.data.notificationsNumber }
    }
}