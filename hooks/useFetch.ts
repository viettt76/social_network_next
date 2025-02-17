import { useEffect, useState } from 'react';

const useFetch = <T>(fetchFunction: (() => Promise<{ data: T }>) | Promise<{ data: T }>) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = fetchFunction instanceof Promise ? await fetchFunction : await fetchFunction();
                setData(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { data, loading };
};

export default useFetch;
