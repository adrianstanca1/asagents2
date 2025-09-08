import React, { useState, useEffect } from 'react';
import { User, View, Role, Project } from './types';
import { Login } from './components/Login';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { useReminderService } from './hooks/useReminderService';
import { DocumentsView } from './components/DocumentsView';
import { ProjectDetailView } from './components/ProjectDetailView';
import { AISearchModal } from './components/AISearchModal';
import { SettingsView } from './components/SettingsView';
import { api } from './services/mockApi';
import { CommandPalette } from './components/CommandPalette';
import { useCommandPalette } from './hooks/useCommandPalette';


interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const baseClasses = 'p-4 rounded-md shadow-lg text-white flex items-center gap-3';
    const typeClasses = {
        success: 'bg-green-600',
        error: 'bg-red-600',
    };

    const Icon = () => {
        if (type === 'success') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <Icon />
            <span>{message}</span>
            <button onClick={onDismiss} className="ml-auto -mr-2 p-1 rounded-md hover:bg-white/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useCommandPalette();
  
  // Activate the reminder service when a user is logged in
  useReminderService(currentUser);

  useEffect(() => {
    // Apply theme to the root element
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView('dashboard'); // Reset to dashboard on login
    setSelectedProject(null); // Reset project view on login
    addToast(`Welcome back, ${user.name}!`, 'success');
    
    // Fetch user/company settings to get the theme
    api.getCompanySettings(user.companyId).then(settings => {
        if (settings?.theme) {
            setTheme(settings.theme);
        }
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleSelectProject = (project: Project | null) => {
    setSelectedProject(project);
    if(project === null) {
        // When going back from a project, ensure the active view is relevant
        setActiveView('dashboard');
    }
  }

  const renderActiveView = () => {
    if (!currentUser) return null;

    if (selectedProject) {
        return <ProjectDetailView project={selectedProject} user={currentUser} onBack={() => handleSelectProject(null)} addToast={addToast} />;
    }

    if (activeView === 'documents') {
      return <DocumentsView user={currentUser} addToast={addToast} />;
    }

    if (activeView === 'settings') {
        return <SettingsView user={currentUser} addToast={addToast} theme={theme} setTheme={setTheme} />;
    }
    
    return <Dashboard user={currentUser} addToast={addToast} activeView={activeView} onSelectProject={handleSelectProject} />;
  }


  if (!currentUser) {
    return (
        <>
            <Login onLogin={handleLogin} />
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </div>
        </>
    );
  }

  return (
    <>
        <div className="flex h-screen bg-slate-50">
          <Sidebar user={currentUser} activeView={activeView} setActiveView={setActiveView} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
                user={currentUser} 
                onLogout={handleLogout}
                onSearchClick={() => setIsAiSearchOpen(true)}
                onCommandPaletteClick={() => setIsCommandPaletteOpen(true)}
             />
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {renderActiveView()}
            </main>
          </div>
        </div>
        {isAiSearchOpen && (
            <AISearchModal 
                user={currentUser}
                currentProject={selectedProject}
                onClose={() => setIsAiSearchOpen(false)}
                addToast={addToast}
            />
        )}
        {isCommandPaletteOpen && (
            <CommandPalette
                user={currentUser}
                onClose={() => setIsCommandPaletteOpen(false)}
                setActiveView={setActiveView}
                onSelectProject={(project) => {
                    handleSelectProject(project);
                    setIsCommandPaletteOpen(false);
                }}
            />
        )}
        <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    </>
  );
};

export default App;