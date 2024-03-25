import React, { ChangeEvent, useCallback, useState } from "react";
import styles from "./search.module.css";
import { Button } from "../generic/button/button";

interface SearchProps {
    onSearch: (searchString: string) => void;
    initialValue: string;
}

function Search({ onSearch, initialValue }: SearchProps) {
    const [searchString, setSearchString] = useState(initialValue);

    const changeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchString(e.target.value);
    }, []);

    const buttonClickHandler = useCallback(() => {
        onSearch(searchString);
    }, [searchString, onSearch]);

    return (
        <div className={styles.searchContainer}>
            <label className={styles.label} htmlFor="search">
                Enter the song you want to find
            </label>
            <input
                className={styles.input}
                id="search"
                type="search"
                onChange={changeHandler}
                value={searchString}
            />
            <Button text="SEARCH" onClick={buttonClickHandler} />
        </div>
    );
}

export default Search;
