import React, { ChangeEvent, useCallback } from "react";

import { ITrack } from "../types/track.type";
import { TrackList } from "../tracklist/tracklist";
import styles from "./playlist.module.css";
import { Button } from "../generic/button/button";

interface PlaylistProps {
    tracks: ITrack[];
    onRemove: (id: string) => void;
    onSaveToSpotify: () => void;
    onPlaylistNameChange: (name: string) => void;
    name: string;
    id: string;
    disableButton: boolean;
}

export function Playlist(props: PlaylistProps) {
    const {
        tracks,
        onRemove,
        onSaveToSpotify,
        onPlaylistNameChange,
        name,
        id,
        disableButton,
    } = props;

    // const selectToPlaylist = useCallback(() => {
    //     onSelectToPlaylist();
    // }, [onSelectToPlaylist]);

    const playlistNameChangeHandler = useCallback(
        ({ target }: ChangeEvent<HTMLInputElement>) => {
            onPlaylistNameChange(target.value);
        },
        [onPlaylistNameChange],
    );

    return (
        <div className={styles.playList}>
            <input
                className={styles.playListName}
                type="text"
                value={name}
                onChange={playlistNameChangeHandler}
            />
            <TrackList tracks={tracks} canAdd={false} onRemove={onRemove} />
            <Button
                text={id ? "UPDATE PLAYLIST" : "SAVE TO SPOTIFY"}
                onClick={onSaveToSpotify}
                disabled={disableButton}
            />
        </div>
    );
}
