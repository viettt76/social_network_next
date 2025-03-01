import { useEffect, useState } from 'react';

const useMoviesPerSlide = () => {
    const [moviesPerSlide, setMoviesPerSlide] = useState(6);

    useEffect(() => {
        const updateMoviesPerSlide = () => {
            if (window.innerWidth >= 1400) {
                setMoviesPerSlide(6);
            } else if (window.innerWidth >= 1200) {
                setMoviesPerSlide(6);
            } else if (window.innerWidth >= 992) {
                setMoviesPerSlide(5);
            } else if (window.innerWidth >= 768) {
                setMoviesPerSlide(4);
            } else if (window.innerWidth >= 576) {
                setMoviesPerSlide(3);
            } else {
                setMoviesPerSlide(2);
            }
        };

        updateMoviesPerSlide();
        window.addEventListener('resize', updateMoviesPerSlide);
        return () => window.removeEventListener('resize', updateMoviesPerSlide);
    }, []);

    return moviesPerSlide;
};

export default useMoviesPerSlide;
