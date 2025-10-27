import React, { useState } from 'react';
import { FileText, PlusCircle, BarChart3, Home, LogOut, User, Lock, ChevronDown } from 'lucide-react';
import ChangePassword from './ChangePassword';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  user: any;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, user, onSignOut }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-job', label: 'Add Job', icon: PlusCircle },
    { id: 'jobs', label: 'All Jobs', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-white text-xl font-bold">Iron & Clean Pro</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        currentView === item.id
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center space-x-3 border-l border-slate-600 pl-4">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-slate-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">{user?.email}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowChangePassword(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors border-t border-slate-200"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <div className="md:hidden pb-3">
            <div className="flex space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                      currentView === item.id
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default Layout;