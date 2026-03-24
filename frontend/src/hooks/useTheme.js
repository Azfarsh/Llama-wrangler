import { useState, useCallback, useEffect } from 'react';

export function useTheme() {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

    const toggle = useCallback(() => {
        setDark((prev) => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            document.documentElement.classList.toggle('theme-light', !next);
            return next;
        });
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('theme-light', !dark);
    }, [dark]);

    return { dark, toggle };
}
