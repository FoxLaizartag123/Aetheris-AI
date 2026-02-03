import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, Attachment } from '../types';
import { User, Loader2, Copy, Check, Download, X, Maximize2, FileText, ImageIcon } from 'lucide-react';
import { AetherisLogo } from './logo';

interface ChatAreaProps {
  messages: Message[];
  isGenerating: boolean;
}

const TypingEffect: React.FC<{ text: string; delay?: number }> = ({ text, delay = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);
  return <span>{displayedText}</span>;
};

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isGenerating }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => setShowTyping(true), []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleCopyCode = async (code: string, setCopied: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('Failed to copy!', err); }
  };

  const handleDownloadImage = async (src: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aetheris_image_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(src, '_blank');
    }
  };

  const renderAttachments = (attachments: Attachment[], isModel: boolean) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className={`flex flex-wrap gap-4 mt-3 ${isModel ? 'justify-start w-full' : 'justify-end'}`}>
        {attachments.map((att, idx) => (
          <div key={idx} className="flex flex-col gap-2 group animate-[fadeIn_0.3s_ease-out] max-w-full">
            <div className="relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-xl bg-gray-100 dark:bg-gray-800 transition-all hover:scale-[1.01] hover:shadow-2xl">
              {att.type === 'image' ? (
                <div className="relative">
                  <img 
                    src={att.previewUrl} 
                    alt="AI Generated" 
                    className="w-full h-auto max-w-full sm:max-w-[400px] max-h-[500px] object-contain cursor-zoom-in"
                    onClick={() => setExpandedImage(att.previewUrl)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <button 
                    onClick={() => setExpandedImage(att.previewUrl)}
                    className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-28 flex flex-col items-center justify-center p-4 text-center">
                  <FileText size={40} className="text-gray-400 mb-2" />
                  <span className="text-xs font-mono truncate w-full text-gray-500">{att.file.name}</span>
                </div>
              )}
            </div>
            {isModel && att.type === 'image' && (
              <button 
                onClick={() => handleDownloadImage(att.previewUrl)}
                className="glass-button text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95"
              >
                <Download size={16} />
                Download Original
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative group">
             <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
             <div className="relative w-24 h-24 rounded-3xl glass-panel bg-white/40 flex items-center justify-center border border-white/50 shadow-2xl">
                 <img src={AetherisLogo} alt="Logo" className="w-16 h-16" />
             </div>
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
              {showTyping && <TypingEffect text="Good Morning" delay={100} />}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {showTyping && <TypingEffect text="How can I help you today?" delay={50} />}
            </p>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md overflow-hidden ${msg.role === MessageRole.USER ? 'bg-gray-800 dark:bg-white text-white dark:text-black' : 'bg-transparent'}`}>
                {msg.role === MessageRole.USER ? <User size={16} /> : <img src={AetherisLogo} alt="AI" className="w-full h-full object-cover" />}
              </div>
              <div className={`flex flex-col gap-2 ${msg.role === MessageRole.USER ? 'items-end' : 'items-start w-full'}`}>
                {msg.text && (
                  <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.role === MessageRole.USER ? 'bg-blue-600 text-white rounded-tr-sm' : 'glass-panel bg-white/95 dark:bg-[#1a1a1c]/95 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-gray-800/50'}`}>
                    {msg.isThinking ? (
                      <div className="flex items-center gap-2 text-blue-500 font-medium animate-pulse">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className={`markdown-body ${msg.role === MessageRole.USER ? 'text-white' : 'dark:text-gray-100'}`}>
                        <ReactMarkdown
                          components={{
                            code({node, inline, className, children, ...props}: any) {
                              if (!inline) {
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match ? match[1] : 'text';
                                const codeContent = String(children).replace(/\n$/, '');
                                const [copied, setCopied] = React.useState(false);
                                return (
                                  <div className="block my-3 rounded-xl overflow-hidden border border-gray-200/50 dark:border-white/10 bg-gray-900/5 dark:bg-black/30 backdrop-blur-sm group">
                                    <div className="bg-gray-100/50 dark:bg-white/5 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center">
                                      <span className="uppercase font-semibold tracking-wider opacity-80">{lang}</span>
                                      <button onClick={() => handleCopyCode(codeContent, setCopied)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 flex items-center gap-1">
                                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        <span className="hidden sm:inline">Copy</span>
                                      </button>
                                    </div>
                                    <code className="block p-3 font-mono text-xs md:text-sm overflow-x-auto" {...props}>{children}</code>
                                  </div>
                                );
                              } 
                              return <code className="bg-gray-200/40 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs" {...props}>{children}</code>;
                            },
                            img() { return null; } // Explicitly ignore markdown images as we use structured attachments
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
                {renderAttachments(msg.attachments || [], msg.role === MessageRole.MODEL)}
              </div>
            </div>
          </div>
        ))
      )}
      {isGenerating && (
         <div className="flex justify-start w-full">
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-full"><img src={AetherisLogo} alt="AI" className="w-full h-full animate-pulse" /></div>
               <div className="glass-panel px-4 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1 bg-white/5 border border-white/10">
                 <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
               </div>
            </div>
         </div>
      )}
      <div ref={scrollRef} />

      {expandedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-[fadeIn_0.3s_ease-out]" onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-6xl w-full flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setExpandedImage(null)} className="absolute -top-14 right-0 p-3 text-white/50 hover:text-white bg-white/5 rounded-full transition-colors"><X size={32} /></button>
             <img src={expandedImage} alt="Expanded AI Generation" className="max-w-full max-h-[85vh] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 object-contain ring-1 ring-white/10" />
             <div className="flex gap-4">
               <button onClick={() => handleDownloadImage(expandedImage)} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-2xl shadow-blue-500/30 transition-all active:scale-95">
                 <Download size={22} /> Download Original File
               </button>
               <button onClick={() => setExpandedImage(null)} className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 transition-all">Close Preview</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;