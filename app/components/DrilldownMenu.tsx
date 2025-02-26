import { cn } from '@/lib/utils';
import { isValidElement, ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useClickOutside from '@/hooks/useClickOutside';

type Position =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

export interface DrilldownMenuItem {
    label?: string | ReactNode;
    children?: DrilldownMenuItem[];
    extraHeaderContent?: string | ReactNode;
}

interface DrilldownMenuProps {
    items: DrilldownMenuItem[];
    children: ReactNode;
    className?: string;
    position?: Position;
}

const DrilldownMenu = ({ items, className, position, children }: DrilldownMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [showMenu, setShowMenu] = useState(false);

    const [history, setHistory] = useState<DrilldownMenuItem[][]>([items]);

    useEffect(() => {
        setHistory([items]);
    }, [items]);

    useClickOutside(menuRef, () => setShowMenu(false));

    const currentMenu = history[history.length - 1];

    const handleNext = (submenu: DrilldownMenuItem[]) => {
        setHistory((prev) => [...prev, submenu]);
    };

    const handleBack = () => {
        setHistory((prev) => prev.slice(0, -1));
    };

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

    return (
        <div className="relative">
            <span onClick={() => setShowMenu(true)}>{children}</span>
            {showMenu && (
                <div
                    ref={menuRef}
                    className={cn(
                        'w-64 absolute bg-white text-foreground shadow-all-sides overflow-x-hidden overflow-y-auto max-h-80 rounded-lg p-2 z-50',
                        position && positionClasses[position],
                        className,
                    )}
                >
                    {history.length > 1 && (
                        <div className="flex justify-between items-center mb-1">
                            <button onClick={handleBack} className="mb-1 text-blue-500">
                                ←
                            </button>
                            {history[history.length - 1][0]?.extraHeaderContent && (
                                <div>{history[history.length - 1][0].extraHeaderContent}</div>
                            )}
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.ul
                            key={history.length}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentMenu.map((item, index) => (
                                <li
                                    key={index}
                                    className={`py-1 px-2 rounded-2xl cursor-pointer ${
                                        !isValidElement(item.label) && 'hover:bg-input/50'
                                    }`}
                                >
                                    {item.children ? (
                                        <button
                                            className="w-full text-left"
                                            onClick={() => item.children && handleNext(item.children)}
                                        >
                                            {item.label}
                                        </button>
                                    ) : (
                                        <span>{item.label}</span>
                                    )}
                                </li>
                            ))}
                        </motion.ul>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default DrilldownMenu;
