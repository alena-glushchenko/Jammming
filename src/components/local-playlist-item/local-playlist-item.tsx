import React, { useCallback } from "react";
import { Button } from "../generic/button/button";
import { IPlaylist } from "../types/playlist.type";

interface PlaylistListItemProps {
    playlistInfo: IPlaylist;
    onSelectPlaylist: (playlistInfo: IPlaylist) => void;
}

export function LocalPlaylistItem(props: PlaylistListItemProps) {
    const { onSelectPlaylist, playlistInfo } = props;

    const selectPlaylist = useCallback(() => {
        onSelectPlaylist(playlistInfo);
    }, [onSelectPlaylist, playlistInfo]);

    return (
        <div>
            <Button text={playlistInfo.name} onClick={selectPlaylist} />
        </div>
    );
}
