import React from 'react';
import { Role, User, View } from '../../types';

interface SidebarProps {
  user: User;
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
        <span className="mr-4 w-6 h-6">{icon}</span>
        <span className="font-medium">{label}</span>
    </button>
);

const getNavItems = (role: Role): { name: string; icon: React.ReactNode; view: View }[] => {
    const icons = {
        dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>,
        users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023-.59-1.023-1.14 0m5.786 2.062a3 3 0 1 1-4.114 0l3.429-3.43a1.5 1.5 0 0 1 2.12 2.12l-1.484 1.485M12 18a4.5 4.5 0 0 1-8.77-2.121M12 18a4.5 4.5 0 0 0 7.737-3.626M6.25 6.25a2.25 2.25 0 0 1 3.84-1.423a2.25 2.25 0 0 1 3.84 1.423" /></svg>,
        projects: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
        timesheets: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
        documents: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
        safety: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" /></svg>,
        tools: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l.354-.354a3.75 3.75 0 0 0-5.303-5.303l-.354.353M3 21l3.75-3.75m.75-7.5 3-3L11.25 3" /></svg>,
        equipment: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>,
    };

    switch (role) {
        case Role.ADMIN:
            return [
                { name: 'Dashboard', icon: icons.dashboard, view: 'dashboard' },
                { name: 'Users', icon: icons.users, view: 'users' },
                { name: 'Projects', icon: icons.projects, view: 'projects' },
                { name: 'Documents', icon: icons.documents, view: 'documents' },
                { name: 'Equipment', icon: icons.equipment, view: 'equipment' },
                { name: 'Tools', icon: icons.tools, view: 'tools' },
            ];
        case Role.PM:
             return [
                { name: 'Dashboard', icon: icons.dashboard, view: 'dashboard' },
                { name: 'Projects', icon: icons.projects, view: 'projects' },
                { name: 'Timesheets', icon: icons.timesheets, view: 'timesheets' },
                { name: 'Documents', icon: icons.documents, view: 'documents' },
                { name: 'Equipment', icon: icons.equipment, view: 'equipment' },
                { name: 'Tools', icon: icons.tools, view: 'tools' },
            ];
        case Role.FOREMAN:
            return [
                { name: 'Dashboard', icon: icons.dashboard, view: 'dashboard' },
                { name: 'My Projects', icon: icons.projects, view: 'projects' },
            ];
        case Role.SAFETY_OFFICER:
            return [
                { name: 'Dashboard', icon: icons.dashboard, view: 'dashboard' },
                { name: 'Safety Docs', icon: icons.safety, view: 'documents' },
            ];
        case Role.OPERATIVE:
            return [
                { name: 'Dashboard', icon: icons.dashboard, view: 'dashboard' },
                { name: 'Timesheets', icon: icons.timesheets, view: 'timesheets' },
                { name: 'Documents', icon: icons.documents, view: 'documents' },
            ];
        default:
            return [];
    }
};

export const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView }) => {
  const navItems = getNavItems(user.role);
  const settingsIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.554-.225a2.25 2.25 0 0 1 2.162 0l.554.225c.55.219 1.02.684 1.11 1.226l.09.542a2.25 2.25 0 0 0 3.352 2.122l.53-.306c.547-.318 1.21-.19 1.584.323l.37.558a2.25 2.25 0 0 1 0 2.454l-.37.558c-.374.513-.937.641-1.584.323l-.53-.306a2.25 2.25 0 0 0-3.352 2.122l-.09.542c-.09.542-.56 1.007-1.11 1.226l-.554.225a2.25 2.25 0 0 1-2.162 0l-.554-.225a1.125 1.125 0 0 1-1.11-1.226l-.09-.542a2.25 2.25 0 0 0-3.352-2.122l-.53.306c-.547.318-1.21.19-1.584-.323l-.37-.558a2.25 2.25 0 0 1 0-2.454l.37-.558c.374.513.937.641 1.584.323l.53.306a2.25 2.25 0 0 0 3.352-2.122l.09-.542Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-screen p-4 flex-shrink-0">
      <div className="py-4 mb-4">
        <button onClick={() => setActiveView('dashboard')} className="w-full text-2xl font-bold text-center flex items-center justify-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-sky-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m-3-1-3-1.091m0 0-3 1.091m0 0 3 1.091m0 0-3-1.091m9-5.455-3-1.091m0 0L12 5.091m0 0 3 1.091m0 0-3-1.091" />
            </svg>
            ConstructFlow
        </button>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.name}>
              <NavLink 
                icon={item.icon} 
                label={item.name} 
                isActive={activeView === item.view}
                onClick={() => setActiveView(item.view)}
              />
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-shrink-0 pt-4 border-t border-slate-700">
         <NavLink 
            icon={settingsIcon} 
            label="Settings" 
            isActive={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
          />
      </div>
    </div>
  );
};