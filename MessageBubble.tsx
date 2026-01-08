import React, { useState } from 'react';
import { Message } from './types';
import { CodeBlock } from './CodeBlock';
import { Download, Play } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownloadImage = (imageData: string, filenamePrefix: string = 'hydra-pro') => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${filenamePrefix}-${Date.now()}.png`;
    link.click();
  };

  const renderSimulatedVideo = (videoData: string) => {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 shadow-2xl group mb-4">
        <div className="absolute inset-0 pointer-events-none z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="w-full h-full overflow-hidden">
           <img 
             src={videoData} 
             alt="Video Frame" 
             className={`w-full h-full object-cover transform transition-transform duration-[10000ms] ease-in-out ${isPlaying ? 'scale-125 translate-x-4' : 'scale-100'}`}
           />
        </div>
        {!isPlaying && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <button 
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-hydra-cyan/90 hover:bg-white text-black transition-all flex items-center justify-center"
            >
              <Play size={28} className="ml-1" fill="currentColor" />
            </button>
          </div>
        )}
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => handleDownloadImage(videoData, 'hydra-frame')} className="p-2 bg-black/70 text-white rounded-full"><Download size={14}/></button>
        </div>
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        {message.attachment && (
          <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden border border-hydra-cyan/30 shadow-md">
            <img src={message.attachment} alt="User upload" className="w-full h-auto object-cover opacity-90" />
          </div>
        )}
        <div className="whitespace-pre-wrap text-right">{message.text}</div>
      </div>
    );
  }

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(message.text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: message.text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || 'text', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < message.text.length) {
    parts.push({ type: 'text', content: message.text.substring(lastIndex) });
  }

  return (
    <div className="w-full">
      {message.isSimulatedVideo && message.video && renderSimulatedVideo(message.video)}
      {message.image && !message.isSimulatedVideo && (
        <div className="group relative mb-3 rounded-lg overflow-hidden border border-slate-700 shadow-lg bg-black">
          <img src={message.image} alt="Generated content" className="w-full h-auto object-cover" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => handleDownloadImage(message.image!, 'hydra-gen')} className="p-2 bg-black/70 text-white rounded-full"><Download size={14}/></button>
          </div>
        </div>
      )}
      {parts.length === 0 ? (
        <div className="whitespace-pre-wrap">{message.text}</div>
      ) : (
        parts.map((part, index) => (
          part.type === 'code' ? 
            <CodeBlock key={index} code={part.content} language={part.language} /> : 
            <p key={index} className="whitespace-pre-wrap mb-2 last:mb-0">{part.content}</p>
        ))
      )}
    </div>
  );
};