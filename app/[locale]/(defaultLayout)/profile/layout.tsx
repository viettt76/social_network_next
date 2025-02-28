import ProfileHeader from '@/app/components/ProfileHeader';

export default function ProfileLayout({ children }) {
    return (
        <div
            className="min-h-[calc(100vh-4rem)] bg-fixed"
            style={{
                backgroundImage: 'url("/images/background.png")',
            }}
        >
            <ProfileHeader />
            <div className="max-w-[1024px] mx-auto">{children}</div>
        </div>
    );
}
