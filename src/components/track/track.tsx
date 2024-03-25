import React, { useCallback, useRef, useState } from "react";
import { Button } from "../generic/button/button";
import styles from "./track.module.css";

interface TrackProps {
    name: string;
    album: string;
    artist: string;
    id: string;
    canAdd: boolean;
    onAdd?: (id: string) => void;
    onRemove?: (id: string) => void;
    previewUrl: string;
}

export function Track(props: TrackProps) {
    const { name, album, id, artist, canAdd, onAdd, onRemove, previewUrl } =
        props;
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(29);

    const addHandler = useCallback(() => {
        if (onAdd) {
            onAdd(id);
        }
    }, [onAdd, id]);

    const removeHandler = useCallback(() => {
        if (onRemove) {
            onRemove(id);
        }
    }, [onRemove, id]);

    const playHandler = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.2;
            if (isPlaying) {
                setIsPlaying(false);
                audioRef.current.pause();
            } else {
                setIsPlaying(true);
                audioRef.current.play();
            }
        }
    }, [isPlaying]);

    const handleEnded = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    }, []);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <li key={id} className={styles.track}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.play}>
                        <Button
                            text={isPlaying ? "❚❚" : "▶"}
                            onClick={playHandler}
                            disabled={!previewUrl}
                        />
                        <div>
                            <h5>{name}</h5>
                            <h6>
                                {artist} | {album}
                            </h6>
                        </div>
                    </div>
                    {canAdd ? (
                        <Button text="+" onClick={addHandler} />
                    ) : (
                        <Button text="-" onClick={removeHandler} />
                    )}
                    <audio
                        ref={audioRef}
                        onEnded={handleEnded}
                        onTimeUpdate={handleTimeUpdate}
                    >
                        <source src={previewUrl} type="audio/mpeg" />
                    </audio>
                </div>
                <div className={styles.bottomSection}>
                    {previewUrl ? (
                        <>
                            <div className={styles.formatTime}>
                                <p>{`${formatTime(currentTime)} / ${formatTime(duration)}`}</p>
                            </div>
                            <input
                                type="range"
                                disabled
                                value={Math.floor(currentTime)}
                                style={{
                                    background: `linear-gradient(to right, #d3d3d3 0%, #d3d3d3 ${(100 / duration) * currentTime}%, transparent ${(100 / duration) * currentTime}%, transparent 100%)`,
                                }}
                            />
                        </>
                    ) : (
                        <p className={styles.sampleNotAvailable}>
                            The sample for this track is not available
                        </p>
                    )}
                </div>
            </div>
        </li>
    );
}
