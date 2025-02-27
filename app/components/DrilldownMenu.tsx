import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';
import useClickOutside from '@/hooks/useClickOutside';
import { motion, AnimatePresence } from 'framer-motion';

interface DrilldownMenuContextType {
    activeMenu: string;
    setActiveMenu: (menu: string) => void;
    isOpen: boolean;
    toggleMenu: () => void;
    triggerRef: React.RefObject<HTMLSpanElement | null>;
}

const DrilldownMenuContext = createContext<DrilldownMenuContextType | undefined>(undefined);

interface DrilldownMenuProviderProps {
    children: ReactNode;
    className?: string;
}

export function DrilldownMenuProvider({ children, className }: DrilldownMenuProviderProps) {
    const [activeMenu, setActiveMenu] = useState<string>('root');
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleMenu = () => setIsOpen((prev) => !prev);

    const triggerRef = useRef<HTMLSpanElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useClickOutside([triggerRef, contentRef], () => setIsOpen(false));

    return (
        <DrilldownMenuContext.Provider value={{ activeMenu, setActiveMenu, isOpen, toggleMenu, triggerRef }}>
            <div className={cn('relative z-[100]', className)} ref={contentRef}>
                {children}
            </div>
        </DrilldownMenuContext.Provider>
    );
}

interface DrilldownMenuTriggerProps {
    children: ReactNode;
}

export function DrilldownMenuTrigger({ children }: DrilldownMenuTriggerProps) {
    const context = useContext(DrilldownMenuContext);
    if (!context) throw new Error('DrilldownMenuTrigger must be used within DrilldownMenuProvider');
    const { toggleMenu, triggerRef } = context;

    return (
        <span ref={triggerRef} onClick={toggleMenu}>
            {children}
        </span>
    );
}

type Position =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

const positionClasses = {
    'top-left': 'bottom-full right-0',
    'top-center': 'bottom-full left-1/2 transform -translate-x-1/2',
    'top-right': 'bottom-full left-0',
    'center-left': 'top-1/2 right-full transform -translate-y-1/2',
    'center-right': 'top-1/2 left-full transform -translate-y-1/2',
    'bottom-left': 'top-full right-0',
    'bottom-center': 'top-full left-1/2 transform -translate-x-1/2',
    'bottom-right': 'top-full left-0',
};

interface DrilldownMenuContentProps {
    id: string;
    children: ReactNode;
    position?: Position;
    className?: string;
}

export function DrilldownMenuContent({
    id,
    children,
    position = 'bottom-right',
    className,
}: DrilldownMenuContentProps) {
    const context = useContext(DrilldownMenuContext);
    if (!context) throw new Error('DrilldownMenuContent must be used within DrilldownMenuProvider');
    const { activeMenu, isOpen } = context;

    const isActive = isOpen && activeMenu === id;

    return (
        <div
            className={cn(
                'absolute bg-white w-max rounded-lg shadow-all-sides px-2 py-1 overflow-x-hidden',
                positionClasses[position],
                isActive ? 'block' : 'hidden',
                className,
            )}
        >
            <AnimatePresence initial={false} mode="wait">
                {isActive && (
                    <motion.div
                        key={id}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface DrilldownMenuItemProps {
    children: ReactNode;
    submenu?: string;
    className?: string;
}

export function DrilldownMenuItem({ children, submenu, className }: DrilldownMenuItemProps) {
    const context = useContext(DrilldownMenuContext);
    if (!context) throw new Error('DrilldownMenuItem must be used within DrilldownMenuProvider');
    const { setActiveMenu } = context;

    return (
        <div
            onClick={() => submenu && setActiveMenu(submenu)}
            className={cn('px-2 py-1 cursor-pointer hover:bg-gray-100 text-black whitespace-nowrap', className)}
        >
            {children}
        </div>
    );
}
