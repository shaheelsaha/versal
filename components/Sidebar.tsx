



// FIX: Switched to namespace import for React to resolve JSX intrinsic element errors, which is necessary for this project's TypeScript configuration.
import * as React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { ConnectionsIcon, DashboardIcon, ScheduleIcon, SettingsIcon, SparklesIcon, XIcon, ChevronDoubleLeftIcon, CommandLineIcon, BookOpenIcon, AnalyticsIcon } from './icons';

interface SidebarProps {
    onLinkClick: () => void;
    isOpen: boolean;
    toggle: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const NavLink: React.FC<{
    to: string,
    icon: React.ReactElement,
    label: string,
    isCollapsed: boolean,
    onClick: () => void,
}> = ({ to, icon, label, isCollapsed, onClick }) => {
    return (
        <RouterNavLink
            to={to}
            title={isCollapsed ? label : undefined}
            onClick={onClick}
            className={({ isActive }) => `w-full flex items-center text-left py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${
                isCollapsed ? 'px-2 justify-center' : 'px-4'
            } ${
                isActive
                ? 'bg-[#00FFC2] text-black font-bold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
        >
            {/* Fix: Explicitly provide the type for the props in React.cloneElement to resolve a TypeScript inference issue. */}
            {React.cloneElement<{ className?: string }>(icon, { className: `w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}` })}
            <span className={isCollapsed ? 'sr-only' : 'inline-block'}>{label}</span>
        </RouterNavLink>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ onLinkClick, isOpen, toggle, isCollapsed, toggleCollapse }) => {
    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggle}
                aria-hidden="true"
            ></div>
            <aside className={`fixed inset-y-0 left-0 bg-[#0D1117] text-white p-4 flex flex-col z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 border-r border-white/10 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                <div className="flex items-center justify-between mb-10 px-2">
                     <div className="flex items-center overflow-hidden">
                        <img src="https://res.cloudinary.com/ddeaazrgb/image/upload/v1763392782/logo.png" alt="SAHA AI Logo" className="h-28 w-auto mr-2 flex-shrink-0" />
                        <h1 className={`text-xl font-semibold tracking-tight whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>SAHA AI</h1>
                    </div>
                    <button onClick={toggle} className="md:hidden p-1 text-gray-400 hover:text-white" aria-label="Close sidebar">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto pb-4">
                    <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : 'px-4'}`}>
                        <span className={isCollapsed ? 'sr-only' : 'inline'}>Menu</span>
                    </p>
                    <NavLink to="/leads" onClick={onLinkClick} icon={<DashboardIcon />} label="Leads Board" isCollapsed={isCollapsed} />
                    <NavLink to="/schedule" onClick={onLinkClick} icon={<ScheduleIcon />} label="Scheduler" isCollapsed={isCollapsed}/>
                    <NavLink to="/dashboard" onClick={onLinkClick} icon={<AnalyticsIcon />} label="Analytics" isCollapsed={isCollapsed} />
                    <NavLink to="/knowledge" onClick={onLinkClick} icon={<BookOpenIcon />} label="Knowledge Base" isCollapsed={isCollapsed}/>
                    
                    <div className="pt-6 space-y-2">
                        <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : 'px-4'}`}>
                           <span className={isCollapsed ? 'sr-only' : 'inline'}>Configuration</span>
                        </p>
                        <NavLink to="/connections" onClick={onLinkClick} icon={<ConnectionsIcon />} label="Connections" isCollapsed={isCollapsed}/>
                        <NavLink to="/command" onClick={onLinkClick} icon={<CommandLineIcon />} label="Command" isCollapsed={isCollapsed}/>
                        <NavLink to="/persona" onClick={onLinkClick} icon={<SparklesIcon />} label="AI Persona" isCollapsed={isCollapsed}/>
                        <NavLink to="/settings" onClick={onLinkClick} icon={<SettingsIcon />} label="Settings" isCollapsed={isCollapsed}/>
                    </div>
                </nav>

                <div className="flex flex-col space-y-2 mt-4 flex-shrink-0">
                    {isCollapsed ? (
                        <button className="w-10 h-10 mx-auto flex items-center justify-center bg-teal-600/50 hover:bg-teal-600 rounded-full text-white transition-colors" title="Upgrade to Pro">
                            <SparklesIcon className="w-5 h-5"/>
                        </button>
                    ) : (
                        <div className="bg-gradient-to-br from-teal-500/20 to-sky-500/20 rounded-xl p-5 text-center relative overflow-hidden border border-white/10">
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full"></div>
                            <div className="absolute -bottom-8 -left-2 w-24 h-24 bg-white/5 rounded-full"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center mb-3 ring-4 ring-white/5">
                                    <SparklesIcon className="w-6 h-6 text-white"/>
                                </div>
                                <h3 className="font-bold text-white text-md">Upgrade to Pro</h3>
                                <p className="text-xs text-teal-100/80 mt-1 mb-4">Unlock all features and get unlimited access.</p>
                                <button className="w-full bg-[#00FFC2] text-black font-bold text-sm py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="border-t border-white/10 pt-2">
                        <button
                            onClick={toggleCollapse}
                            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <ChevronDoubleLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

// FIX: Added default export for the Sidebar component to resolve the import error.
export default Sidebar;