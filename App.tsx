import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import { generateResponse } from './services/geminiService';
import { Chat, Message, User, MessageRole, AppMode, Attachment } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('aetheris_theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('aetheris_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const savedChats = localStorage.getItem('aetheris_chats');
    if (savedChats) setChats(JSON.parse(savedChats));
  }, []);

  useEffect(() => {
    if (chats.length > 0) localStorage.setItem('aetheris_chats', JSON.stringify(chats));
  }, [chats]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    const savedChats = localStorage.getItem('aetheris_chats');
    if (!savedChats || JSON.parse(savedChats).length === 0) {
      createNewChat();
    } else {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        setActiveChatId(parsed[0].id);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      createdAt: Date.now(),
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (id: string) => {
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    if (activeChatId === id) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
    localStorage.setItem('aetheris_chats', JSON.stringify(updatedChats));
  };

  const isImageRequest = (text: string) => {
    const keywords = [
      'gerar imagem', 'crie uma imagem', 'desenhe', 'faça um desenho', 
      'generate image', 'create image', 'draw', 'make a picture', 
      'imagem de', 'foto de', 'photo of', 'picture of'
    ];
    const lowerText = text.toLowerCase();
    return keywords.some(k => lowerText.includes(k));
  };

  const handleSendMessage = async (text: string, attachments: Attachment[], mode: AppMode) => {
    if (!activeChatId) createNewChat();
    const chatId = activeChatId || (chats.length > 0 ? chats[0].id : Date.now().toString());

    if (mode !== AppMode.IMAGE_GEN && isImageRequest(text)) {
      const newUserMsg: Message = { id: Date.now().toString(), role: MessageRole.USER, text, timestamp: Date.now(), attachments };
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: MessageRole.MODEL, text: "I can't generate images in standard chat. Please switch to 'Create Image' mode in the + menu!", timestamp: Date.now() + 1 };
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, newUserMsg, errorMsg] } : c));
      return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: MessageRole.USER, text, timestamp: Date.now(), attachments };
    
    // Temporary thinking message
    const thinkingMsgId = (Date.now() + 1).toString();
    const thinkingMsg: Message = { 
      id: thinkingMsgId, 
      role: MessageRole.MODEL, 
      text: "", 
      timestamp: Date.now() + 1,
      isThinking: true 
    };

    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const name = c.messages.length === 0 ? (text.slice(0, 30) || "New Conversation") : c.name;
        return { ...c, name, messages: [...c.messages, newUserMsg, thinkingMsg] };
      }
      return c;
    }));

    setIsGenerating(true);
    const currentChat = chats.find(c => c.id === chatId);
    const history = currentChat ? currentChat.messages.filter(m => !m.isThinking) : [];

    try {
      const { text: responseText, generatedAttachments } = await generateResponse(text, history, attachments, mode);

      const finalAiMsg: Message = {
        id: thinkingMsgId,
        role: MessageRole.MODEL,
        text: responseText,
        attachments: generatedAttachments,
        timestamp: Date.now() + 2,
        isThinking: false
      };

      setChats(prev => prev.map(c => c.id === chatId 
        ? { ...c, messages: c.messages.map(m => m.id === thinkingMsgId ? finalAiMsg : m) } 
        : c
      ));
    } catch (err) {
      setChats(prev => prev.map(c => c.id === chatId 
        ? { ...c, messages: c.messages.filter(m => m.id !== thinkingMsgId) } 
        : c
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return <Auth onLogin={handleLogin} />;
  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex h-screen w-full relative bg-gray-50 dark:bg-[#0f0f11] text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Sidebar 
        chats={chats} activeChatId={activeChatId || ''} onSelectChat={setActiveChatId}
        onNewChat={createNewChat} onDeleteChat={deleteChat} isOpenMobile={sidebarOpen}
        closeMobile={() => setSidebarOpen(false)} user={user} theme={theme} toggleTheme={toggleTheme}
      />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="md:hidden flex items-center p-4 pb-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-2 glass-button rounded-xl text-gray-700 dark:text-gray-200">
            <Menu size={20} />
          </button>
          <span className="ml-4 font-bold text-gray-700 dark:text-gray-200">Aetheris</span>
        </div>
        {activeChat ? (
          <>
            <ChatArea messages={activeChat.messages} isGenerating={isGenerating} />
            <InputArea onSendMessage={handleSendMessage} isGenerating={isGenerating} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
             <p className="mb-4 text-lg font-light">Select or create a chat to begin.</p>
             <button onClick={createNewChat} className="glass-button px-8 py-3 rounded-2xl text-blue-600 font-bold shadow-xl shadow-blue-500/10 active:scale-95 transition-all">Start Converation</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;