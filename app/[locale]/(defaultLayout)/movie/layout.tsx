import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function MoviesLayout({ children }) {
    return <div className="bg-[#191919] h-full">{children}</div>;
}
