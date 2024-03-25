import React from "react";
import { ITrack } from "../types/track.type";
import { Track } from "../track/track";
import styles from "./tracklist.module.css";

interface TrackListProps {
    tracks: ITrack[];
    canAdd: boolean;
    onAdd?: (id: string) => void;
    onRemove?: (id: string) => void;
}

export function TrackList(props: TrackListProps) {
    const { tracks, canAdd, onRemove, onAdd } = props;

    return (
        <ul className={styles.trackList}>
            {tracks.map(({ name, artist, album, id, previewUrl }) => (
                <Track
                    name={name}
                    album={album}
                    artist={artist}
                    id={id}
                    canAdd={canAdd}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    key={id}
                    previewUrl={previewUrl}
                />
            ))}
        </ul>
    );
}
