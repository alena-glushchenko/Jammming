import React from "react";
import { IPlaylist } from "../types/playlist.type";
import { LocalPlaylistItem } from "../local-playlist-item/local-playlist-item";

interface PlaylistListProps {
    playlists: IPlaylist[];
    onSelectPlaylist: (playlistInfo: IPlaylist) => void;
}

export function LocalPlaylist(props: PlaylistListProps) {
    const { playlists, onSelectPlaylist } = props;

    return (
        <div>
            <h4>Local Playlist</h4>
            {playlists.map((playlist) => (
                <LocalPlaylistItem
                    key={playlist.id}
                    onSelectPlaylist={onSelectPlaylist}
                    playlistInfo={playlist}
                />
            ))}
        </div>
    );
}
