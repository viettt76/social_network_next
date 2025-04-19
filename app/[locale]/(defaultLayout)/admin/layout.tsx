import SidebarAdmin from '@/app/components/SidebarAdmin';

export default function AdminLayout({ children }) {
    return (
        <div className="bg-gray/20 py-5 h-full">
            <div className="flex max-w-[1024px] mx-auto gap-x-12">
                <SidebarAdmin />
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
