import { ITrack } from "../components/types/track.type";
import { IPlaylist } from "../components/types/playlist.type";

interface SpotifyTrack {
    id: string;
    name: string;
    artists: [
        {
            name: string;
        },
    ];
    album: {
        name: string;
    };
    uri: string;
    preview_url: string;
}

const client_id = "67417ff71e874db1aee59bc954ec700d";
// const client_secret = "6dd236396ce14e4abca8d1f92e0b4889";
const redirectUrl = "http://localhost:3000";

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = "user-read-private user-read-email playlist-modify-public";
const profileUrl = "https://api.spotify.com/v1/me";
const usersUrl = "https://api.spotify.com/v1/users";
const playlistUrl = "https://api.spotify.com/v1/playlists";

export async function getToken(code: string) {
    const code_verifier = localStorage.getItem("code_verifier");

    const response = await fetch(tokenEndpoint, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: client_id,
            code: code,
            redirect_uri: redirectUrl,
            code_verifier: code_verifier || "",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        },
    });
    const responseJson = await response.json();
    localStorage.setItem(
        "token",
        JSON.stringify({
            ...responseJson,
            createDate: Date.now(),
        }),
    );
    return responseJson;
}

export async function getSpotifyUserProfile(
    access_token: string,
): Promise<{ profileId: string; profileImage: string }> {
    const profile = await fetch(profileUrl, {
        method: "GET",
        headers: { Authorization: "Bearer " + access_token },
    });
    const profileResponse = await profile.json();
    const profileId = profileResponse.id;
    const profileImage = profileResponse.images[0].url;

    return {
        profileId,
        profileImage,
    };
}

export async function getUserPlaylists(
    access_token: string,
    userId: string,
): Promise<IPlaylist[]> {
    const responsePlaylists = await fetch(`${usersUrl}/${userId}/playlists`, {
        method: "GET",
        headers: { Authorization: "Bearer " + access_token },
    });

    const responseJson = await responsePlaylists.json();

    return responseJson.items.map((playlist: IPlaylist) => ({
        name: playlist.name,
        id: playlist.id,
    }));
}

export async function getUserPlaylistTracks(
    access_token: string,
    userId: string,
    playlistId: string,
): Promise<{ ok: boolean; tracks: ITrack[]; errorMsg: string }> {
    try {
        const itemPlaylist = await fetch(
            `${usersUrl}/${userId}/playlists/${playlistId}/tracks`,
            {
                method: "GET",
                headers: { Authorization: "Bearer " + access_token },
            },
        );

        const responseJson = await itemPlaylist.json();
        if (responseJson.error) {
            return {
                ok: false,
                tracks: [],
                errorMsg: responseJson.error.message,
            };
        }
        return {
            ok: true,
            tracks: responseJson.items.map(
                (tracksInfo: { track: SpotifyTrack }) => ({
                    id: tracksInfo.track.id,
                    name: tracksInfo.track.name,
                    artist: tracksInfo.track.artists[0].name,
                    album: tracksInfo.track.album.name,
                    uri: tracksInfo.track.uri,
                    previewUrl: tracksInfo.track.preview_url,
                }),
            ),
            errorMsg: "",
        };
    } catch (error: any) {
        return {
            ok: false,
            tracks: [],
            errorMsg: error.message,
        };
    }
}

export async function createSpotifyPlaylist(
    access_token: string,
    userId: string,
    namePlaylist: string,
): Promise<string> {
    const response = await fetch(`${usersUrl}/${userId}/playlists`, {
        method: "POST",
        body: JSON.stringify({
            name: namePlaylist,
            description: "",
            public: "true",
        }),
        headers: { Authorization: "Bearer " + access_token },
    });

    const responseJson = await response.json();
    return responseJson.id;
}

export async function saveTracksToSpotifyPlaylist(
    access_token: string,
    playlistId: string,
    arrayTracksUri: string[],
) {
    return await fetch(`${playlistUrl}/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({
            uris: arrayTracksUri,
            position: 0,
        }),
        headers: {
            Authorization: "Bearer " + access_token,
            "Content-Type": "application/json",
        },
    });
}

export async function updateTracksInSpotifyPlaylist(
    access_token: string,
    playlistId: string,
    arrayTracksUri: string[],
) {
    return await fetch(`${playlistUrl}/${playlistId}/tracks`, {
        method: "PUT",
        body: JSON.stringify({
            uris: arrayTracksUri,
        }),
        headers: {
            Authorization: "Bearer " + access_token,
            "Content-Type": "application/json",
        },
    });
}

export async function spotifyAuthorize() {
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce(
        (acc, x) => acc + possible[x % possible.length],
        "",
    );

    const code_verifier = randomString;
    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest("SHA-256", data);

    const code_challenge_base64 = btoa(
        String.fromCharCode(...new Uint8Array(hashed)),
    )
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    window.localStorage.setItem("code_verifier", code_verifier);

    const authUrl = await new URL(authorizationEndpoint);
    const params = {
        response_type: "code",
        client_id: client_id,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: code_challenge_base64,
        redirect_uri: redirectUrl,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

export async function search(
    query: string,
    access_token: string,
    limit: string,
): Promise<ITrack[]> {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}`,
            {
                method: "GET",
                headers: { Authorization: "Bearer " + access_token },
            },
        );

        const jsonResponse = await response.json();

        return jsonResponse.tracks.items.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri,
            previewUrl: track.preview_url,
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

// getToken().then(response => {
//     getTrackInfo(response.access_token).then(profile => {
//         console.log(profile)
//     })
// });
