import React from "react";
import styles from "./button.module.css";

interface ButtonProps {
    text: string;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
}

export function Button(props: ButtonProps) {
    const { text, onClick, disabled } = props;
    return (
        <button
            className={styles.button}
            type="button"
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
}
