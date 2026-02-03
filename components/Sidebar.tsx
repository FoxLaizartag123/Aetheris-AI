import React, { useState } from 'react';
import { Chat, User } from '../types';
import { Trash2, MessageSquarePlus, Search, MessageSquare, LogOut, Settings, X, Moon, Sun, UserCircle } from 'lucide-react';
import { AetherisLogo } from './logo';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpenMobile: boolean;
  closeMobile: () => void;
  user: User | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpenMobile,
  closeMobile,
  user,
  theme,
  toggleTheme
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:relative z-40 h-full w-72 
        transform transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
        glass-panel md:rounded-none md:border-r border-gray-200 dark:border-white/10
        bg-gray-50/80 dark:bg-black/80
      `}>
        {/* Header / Brand */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-6 px-2">
            <img src={AetherisLogo} alt="Logo" className="w-8 h-8 drop-shadow-md" />
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Aetheris
            </h1>
          </div>

          {/* Main Actions */}
          <div className="space-y-3">
            <button 
              onClick={() => { onNewChat(); closeMobile(); }}
              className="w-full glass-button rounded-xl p-3 flex items-center justify-between text-gray-700 dark:text-gray-200 font-medium hover:bg-white/50 dark:hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-2">
                  <div className="bg-gray-200 dark:bg-white/10 p-1 rounded-lg"><MessageSquarePlus size={18} /></div>
                  <span className="text-sm">New Chat</span>
              </div>
            </button>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-700 dark:text-gray-300 focus:bg-white/50 dark:focus:bg-white/5 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3 mt-4">History</div>
          {filteredChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => { onSelectChat(chat.id); closeMobile(); }}
              className={`
                group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200
                ${activeChatId === chat.id 
                    ? 'bg-gray-200/60 dark:bg-white/10 text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}
              `}
            >
              <span className="text-sm truncate w-4/5">
                {chat.name}
              </span>
              
              <button 
                onClick={(e) => handleDeleteClick(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* USER PROFILE SECTION (Bottom) */}
        <div className="p-3 border-t border-gray-200 dark:border-white/10">
            <button 
                onClick={() => setShowProfile(true)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.username?.substring(0,2).toUpperCase() || 'US'}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">{user?.username || 'User'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Free Plan</div>
                    </div>
                </div>
                <Settings size={16} className="text-gray-400" />
            </button>
        </div>
      </aside>

      {/* SETTINGS / PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-md glass-panel bg-white/90 dark:bg-[#1a1a1a]/95 rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Settings</h2>
                    <button onClick={() => setShowProfile(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800 dark:text-white">Appearance</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</div>
                            </div>
                        </div>
                        <button 
                           onClick={toggleTheme}
                           className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-white/5" />

                    {/* Account Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                             {user?.username?.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-lg font-medium text-gray-800 dark:text-white">{user?.username}</div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                    </div>

                    <button className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <LogOut size={16} />
                        Log out
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Chat Confirmation */}
      {chatToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="glass-panel bg-white/80 dark:bg-gray-900/90 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Chat?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setChatToDelete(null)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;