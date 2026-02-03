import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Image as ImageIcon, Search, FileText, BrainCircuit, X } from 'lucide-react';
import { AppMode, Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[], mode: AppMode) => void;
  isGenerating: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isGenerating }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [showMenu, setShowMenu] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(text, attachments, mode);
    setText('');
    setAttachments([]);
    if (mode === AppMode.IMAGE_GEN) {
        // Keep image gen mode active or reset? Prompt implies it's a toggle. 
        // We'll keep it active for convenience, user can switch back manually if needed, 
        // or we can auto-reset. Let's keep it until changed.
    } else {
        // Reset to chat for others
        if (mode !== AppMode.CHAT) setMode(AppMode.CHAT);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newAttachments.push({
          file,
          previewUrl: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'file',
          mimeType: file.type
        });
      }
      setAttachments([...attachments, ...newAttachments]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const toggleMode = (newMode: AppMode) => {
    setMode(newMode);
    setShowMenu(false);
    
    // If selecting file mode, trigger click
    if (newMode === AppMode.CHAT && fileInputRef.current) { 
        // Actually, send files is an action in the menu, not exactly a mode 
        // but we handle it here for logic simplicity
    }
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
      setShowMenu(false);
  }

  const getModeIcon = () => {
    switch(mode) {
      case AppMode.IMAGE_GEN: return <ImageIcon size={18} className="text-purple-500" />;
      case AppMode.WEB_SEARCH: return <Search size={18} className="text-blue-500" />;
      case AppMode.INVESTIGATE: return <BrainCircuit size={18} className="text-amber-500" />;
      default: return null;
    }
  };

  const getPlaceholder = () => {
    switch(mode) {
      case AppMode.IMAGE_GEN: return "Describe the image you want to create...";
      case AppMode.WEB_SEARCH: return "Ask me to search the web...";
      case AppMode.INVESTIGATE: return "What should I investigate deeply?";
      default: return "Ask anything...";
    }
  };

  return (
    <div className="p-4 md:p-6 pt-0">
      {/* Container background adjusted for Dark Mode to ensure white text is readable (dark:bg-black/40) */}
      <div className="glass-panel p-2 rounded-3xl shadow-lg border border-white/50 dark:border-white/10 relative bg-white/40 dark:bg-black/40 backdrop-blur-md">
        
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-3 px-3 py-2 overflow-x-auto">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group shrink-0">
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
                {att.type === 'image' ? (
                  <img src={att.previewUrl} className="w-16 h-16 rounded-lg object-cover border border-white/60" alt="preview" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-white/60 flex items-center justify-center">
                    <FileText size={24} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Plus Menu Button */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${showMenu ? 'bg-gray-800 text-white rotate-45' : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-md'}
              `}
            >
              <Plus size={20} />
            </button>

            {/* Popup Menu */}
            {showMenu && (
              <div className="absolute bottom-14 left-0 w-56 glass-panel bg-white/90 rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.2s_ease-out] z-50 flex flex-col p-1.5 border border-white/60">
                <button 
                  onClick={() => toggleMode(AppMode.WEB_SEARCH)}
                  className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl text-left text-sm font-medium text-gray-700 transition-colors"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Search size={16} /></div>
                  Search the Web
                </button>
                <button 
                  onClick={() => toggleMode(AppMode.IMAGE_GEN)}
                  className="flex items-center gap-3 p-2.5 hover:bg-purple-50 rounded-xl text-left text-sm font-medium text-gray-700 transition-colors"
                >
                  <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600"><ImageIcon size={16} /></div>
                  Create Image
                </button>
                <button 
                  onClick={() => toggleMode(AppMode.INVESTIGATE)}
                  className="flex items-center gap-3 p-2.5 hover:bg-amber-50 rounded-xl text-left text-sm font-medium text-gray-700 transition-colors"
                >
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600"><BrainCircuit size={16} /></div>
                  Investigate
                </button>
                 <div className="h-px bg-gray-200 my-1 mx-2" />
                <button 
                  onClick={triggerFileUpload}
                  className="flex items-center gap-3 p-2.5 hover:bg-green-50 rounded-xl text-left text-sm font-medium text-gray-700 transition-colors"
                >
                   <div className="p-1.5 bg-green-100 rounded-lg text-green-600"><FileText size={16} /></div>
                  Send Files
                </button>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            {mode !== AppMode.CHAT && (
               <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                 {getModeIcon()}
               </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={isGenerating}
              className={`
                w-full bg-transparent border-0 focus:ring-0 resize-none py-3 
                text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                ${mode !== AppMode.CHAT ? 'pl-9' : 'pl-2'}
              `}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Mode Indicator / Cancel Mode */}
          {mode !== AppMode.CHAT && (
              <button 
                onClick={() => setMode(AppMode.CHAT)}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded-md mb-3 mr-1"
              >
                  Exit {mode === AppMode.IMAGE_GEN ? 'Image' : mode === AppMode.INVESTIGATE ? 'Investigate' : 'Search'}
              </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || isGenerating}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md mb-0.5
              ${(!text.trim() && attachments.length === 0) || isGenerating 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'}
            `}
          >
            <Send size={18} className={isGenerating ? "opacity-0" : "ml-0.5"} />
          </button>
        </div>
      </div>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />
    </div>
  );
};

export default InputArea;