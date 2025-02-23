import { useState, useEffect } from 'react';

const useDebounce = (value: string, delay: number) => {
    const [valueDebounced, setValueDebounced] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setValueDebounced(value);
        }, delay);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [value, delay]);

    return valueDebounced;
};

export default useDebounce;
