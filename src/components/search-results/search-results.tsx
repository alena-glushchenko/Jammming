import React from 'react';

import styles from "./search-results.module.css";
import {ITrack} from "../types/track.type";
import {TrackList} from "../tracklist/tracklist";

interface SearchResultsProps {
    tracks: ITrack[],
    onAddTrack: (id: string) => void,
}

export function SearchResults(props: SearchResultsProps) {
    const {tracks, onAddTrack} = props;

    return (
        <div className={styles.searchResults}>
            <div className={styles.title}>
                <h4>Results</h4>
            </div>
            <TrackList tracks={tracks} canAdd onAdd={onAddTrack}/>
        </div>
    );
}