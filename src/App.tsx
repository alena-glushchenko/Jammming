import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

import Search from "./components/search/search";
import { SearchResults } from "./components/search-results/search-results";
import { Playlist } from "./components/playlist/playlist";
import { ITrack } from "./components/types/track.type";
import {
    createSpotifyPlaylist,
    getSpotifyUserProfile,
    getToken,
    getUserPlaylists,
    getUserPlaylistTracks,
    saveTracksToSpotifyPlaylist,
    search,
    spotifyAuthorize,
    updateTracksInSpotifyPlaylist,
} from "./utils/spotify-api";
import { Button } from "./components/generic/button/button";
import myImg from "./assets/double-arrow.png";
import loadingScreen from "./assets/packman.svg";
import { LocalPlaylist } from "./components/local-playlist/local-playlist";
import { IPlaylist } from "./components/types/playlist.type";

function App() {
    const [searchResults, setSearchResults] = useState<ITrack[]>([]);
    const [playlistTracks, setPlaylistTracks] = useState<ITrack[]>([]);
    const [playlistName, setPlaylistName] = useState("New Playlist");
    const [signedIn, setSignedIn] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchString, setSearchString] = useState("");
    const tokenIntervalRef = useRef(0);
    const [disableUpdateButton, setDisableUpdateButton] = useState(true);

    const [localPlaylists, setLocalPlaylists] = useState<IPlaylist[]>([]);
    const [playlistId, setPlaylistId] = useState("");

    const [open, setOpen] = useState(false);
    const [snackbarText, setSnackbarText] = useState("");
    const snackbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const snackbarOpen = (text: string) => {
        setOpen(true);
        setSnackbarText(text);
        if (snackbarTimeoutRef.current) {
            clearTimeout(snackbarTimeoutRef.current);
        }
        snackbarTimeoutRef.current = setTimeout(() => {
            snackbarClose();
        }, 3000);
    };

    const snackbarClose = () => {
        setOpen(false);
        setSnackbarText("");
        if (snackbarTimeoutRef.current) {
            clearTimeout(snackbarTimeoutRef.current);
        }
    };

    useEffect(() => {
        const localData = window.localStorage.getItem("playlist_data");
        const localDataName = window.localStorage.getItem("playlist_data_name");
        const localPlaylistId = window.localStorage.getItem("playlist_id");

        if (localData) {
            setPlaylistTracks(JSON.parse(localData));
        }

        if (localDataName) {
            setPlaylistName(localDataName);
        }

        if (localPlaylistId) {
            setPlaylistId(localPlaylistId);
        }
    }, []);

    useEffect(() => {
        const playlistTracksString = JSON.stringify(playlistTracks);

        window.localStorage.setItem("playlist_data", playlistTracksString);
        window.localStorage.setItem("playlist_data_name", playlistName);
        window.localStorage.setItem("playlist_id", playlistId);
    }, [playlistId, playlistName, playlistTracks]);

    const getPlaylists = async () => {
        const tokenInfo = localStorage.getItem("token");
        const tokenInfoParsed = tokenInfo ? JSON.parse(tokenInfo) : null;

        const profile = await getSpotifyUserProfile(
            tokenInfoParsed.access_token,
        );

        if (tokenInfoParsed) {
            setLocalPlaylists(
                await getUserPlaylists(
                    tokenInfoParsed.access_token,
                    profile.profileId,
                ),
            );
        }
    };

    const loadInitialData = async () => {
        const localSearchString = window.localStorage.getItem("search_string");

        if (localSearchString) {
            setSearchString(localSearchString);
            await handlerUserSearch(localSearchString);
        }
        await getPlaylists();
    }; //делает поиск по последнему запросу пользователя + достает все плейлисты пользователя

    const runTokenInterval = (tokenInfo: string) => {
        tokenIntervalRef.current = setInterval((item) => {
            validateToken(tokenInfo);
        }, 1000);
    };

    useEffect(() => {
        (async () => {
            const args = new URLSearchParams(window.location.search);
            const code = args.get("code");
            if (code) {
                const tokenInfo = await getToken(code);
                runTokenInterval(tokenInfo);

                if (tokenInfo) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("code");

                    const updatedUrl = url.search
                        ? url.href
                        : url.href.replace("?", "");
                    window.history.replaceState({}, document.title, updatedUrl);

                    await loadInitialData();
                    setSignedIn(true);
                } else {
                    console.error(
                        "Something went wrong!!! Could not find access token.",
                    );
                    setSignedIn(false);
                    snackbarOpen("Could not find access token");
                }
            } else {
                const tokenInfo = localStorage.getItem("token");
                if (tokenInfo) {
                    const tokenInfoParsed = tokenInfo
                        ? JSON.parse(tokenInfo)
                        : null;
                    const isTokenValid = validateToken(tokenInfoParsed);

                    if (isTokenValid) {
                        runTokenInterval(tokenInfo);
                        await loadInitialData();
                        setSignedIn(true);
                    }
                } else {
                    setSignedIn(false);
                    snackbarOpen("Could not find access token");
                }
            }
        })();
        return () => {
            clearInterval(tokenIntervalRef.current);
        };
    }, []);

    const validateToken = (tokenInfo: any) => {
        if (tokenInfo) {
            const expired =
                Date.now() - tokenInfo.createDate > tokenInfo.expires_in * 1000;
            setSignedIn(!expired);

            if (expired) {
                clearInterval(tokenIntervalRef.current);
            }
            return !expired;
        } else {
            console.error(
                "Something went wrong!!! Could not find access token.",
            );

            setSignedIn(false);
            snackbarOpen("The connection time has expired, please try again");
            clearInterval(tokenIntervalRef.current);
            return false;
        }
    };

    const handlerUserSearch = async (searchString: string) => {
        const tokenInfo = localStorage.getItem("token");
        const tokenInfoParsed = tokenInfo ? JSON.parse(tokenInfo) : null;

        if (tokenInfoParsed) {
            const result = await search(
                searchString,
                tokenInfoParsed.access_token,
                `${50}`,
            );

            window.localStorage.setItem("search_string", searchString);

            result.sort((a, b) =>
                a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1,
            );
            setSearchResults(result);
        }
    };

    const addTrack = useCallback(
        (id: string) => {
            if (
                playlistTracks.some((savedTrack: any) => savedTrack.id === id)
            ) {
                return;
            }

            const newTrack = searchResults.find((track) => {
                return track.id === id;
            });

            if (newTrack) {
                setPlaylistTracks((prevTracks) => [...prevTracks, newTrack]);
                setDisableUpdateButton(false);
            }
        },
        [playlistTracks, searchResults],
    );

    const removeTrack = useCallback(
        (id: string) => {
            setPlaylistTracks(
                playlistTracks.filter((track) => {
                    return id !== track.id;
                }),
            );
            setDisableUpdateButton(false);
        },
        [playlistTracks],
    );

    const selectPlaylist = useCallback(async (playlistInfo: IPlaylist) => {
        const tokenInfo = localStorage.getItem("token");
        const tokenInfoParsed = tokenInfo ? JSON.parse(tokenInfo) : null;
        const isTokenValid = validateToken(tokenInfoParsed);

        if (isTokenValid) {
            setIsSaving(true);

            const profile = await getSpotifyUserProfile(
                tokenInfoParsed.access_token,
            );

            const infoPlaylistTracks = await getUserPlaylistTracks(
                tokenInfoParsed.access_token,
                profile.profileId,
                playlistInfo.id,
            );
            console.log(infoPlaylistTracks);

            setIsSaving(false);
            setPlaylistName(playlistInfo.name);

            if (infoPlaylistTracks.ok) {
                setPlaylistTracks(infoPlaylistTracks.tracks);
            } else {
                snackbarOpen(infoPlaylistTracks.errorMsg);
            }
            setPlaylistId(playlistInfo.id);
            setDisableUpdateButton(true);
        }
    }, []);

    const saveToSpotify = useCallback(async () => {
        if (playlistTracks.length === 0) return;

        setIsSaving(true);
        const tokenInfo = localStorage.getItem("token");
        const tokenInfoParsed = tokenInfo ? JSON.parse(tokenInfo) : null;
        const isTokenValid = validateToken(tokenInfoParsed);

        if (isTokenValid) {
            const profile = await getSpotifyUserProfile(
                tokenInfoParsed.access_token,
            );

            const uris = playlistTracks.map((track) => {
                return track.uri;
            });

            if (playlistId) {
                //update playlist
                await updateTracksInSpotifyPlaylist(
                    tokenInfoParsed.access_token,
                    playlistId,
                    uris,
                );
                snackbarOpen("The playlist has been successfully changed");
            } else {
                //create new playlist
                const newPlaylistId = await createSpotifyPlaylist(
                    tokenInfoParsed.access_token,
                    profile.profileId,
                    playlistName,
                );
                await saveTracksToSpotifyPlaylist(
                    tokenInfoParsed.access_token,
                    newPlaylistId,
                    uris,
                );
                setLocalPlaylists((prev) => [
                    { name: playlistName, id: newPlaylistId },
                    ...prev,
                ]);

                setPlaylistName("");
                setPlaylistTracks([]);
                setPlaylistId("");
                snackbarOpen("The playlist has been saved successfully");
            }
            setDisableUpdateButton(true);
        }

        setIsSaving(false);
    }, [playlistTracks, validateToken, playlistId, snackbarOpen, playlistName]);

    // console.log(playlistInfo);

    const handlePlaylistNameChange = useCallback((name: string) => {
        setPlaylistName(name);
    }, []);

    return (
        <div className="app">
            <header className="header">
                <h1>
                    Ja<span>mmm</span>ing
                </h1>
            </header>
            <main className="main">
                {!signedIn && (
                    <div className="login-page">
                        <div className="login-container">
                            <h2>
                                Welcome to Ja<span>mmm</span>ing
                            </h2>
                            <h3>Please login to start</h3>
                            <img src={myImg} alt="double-arrow" />
                            <Button
                                text="Click here to login"
                                onClick={spotifyAuthorize}
                            />
                        </div>
                    </div>
                )}
                {signedIn && (
                    <>
                        <Search
                            onSearch={handlerUserSearch}
                            initialValue={searchString}
                        />
                        <div className="main-playlist">
                            <SearchResults
                                tracks={searchResults
                                    .filter((track) => {
                                        return !playlistTracks.some(
                                            (t) => t.id === track.id,
                                        );
                                    })
                                    .slice(0, 10)}
                                onAddTrack={addTrack}
                            />
                            <Playlist
                                tracks={playlistTracks}
                                onRemove={removeTrack}
                                onSaveToSpotify={saveToSpotify}
                                name={playlistName}
                                onPlaylistNameChange={handlePlaylistNameChange}
                                id={playlistId}
                                disableButton={disableUpdateButton}
                            />
                            <LocalPlaylist
                                onSelectPlaylist={selectPlaylist}
                                playlists={localPlaylists}
                            />
                        </div>
                    </>
                )}
            </main>
            {isSaving && (
                <div className="loading-overlay">
                    <img src={loadingScreen} alt="loading-screen-gif" />
                    <p>Loading...</p>
                </div>
            )}
            {
                <div className={open ? "snackbar-show" : "snackbar"}>
                    {snackbarText}
                </div>
            }
            <footer>
                <div className="footer">
                    <p>for non-commercial use only</p>
                </div>
            </footer>
            <div className="overlay" />
        </div>
    );
}

export default App;
