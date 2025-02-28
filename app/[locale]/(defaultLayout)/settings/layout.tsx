import SettingsSidebar from '@/app/components/SettingsSidebar';

export default function SettingsLayout({ children }) {
    return (
        <div className="bg-gray/20 py-5 h-full">
            <div className="flex max-w-[1024px] mx-auto gap-x-5">
                <SettingsSidebar />
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
