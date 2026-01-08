
import React, { useState } from 'react';
import { Message } from './types';
import { CodeBlock } from './CodeBlock';
import { Download, Play, Video } from 'lucide-react';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  const downloadMedia = (data: string, name: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = `${name}-${Date.now()}.png`;
    link.click();
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        {message.attachment && (
          <img src={message.attachment} className="w-40 rounded-lg mb-2 border border-hydra-cyan/30" alt="Upload" />
        )}
        <div className="bg-hydra-blue px-4 py-2 rounded-2xl rounded-tr-none text-white shadow-lg">
          {message.text}
        </div>
      </div>
    );
  }

  const renderVideo = (url: string) => (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black group shadow-2xl">
      <div className={`absolute inset-0 transition-transform duration-[8000ms] ease-in-out ${isPlaying ? 'scale-125 translate-x-4' : 'scale-100'}`}>
        <img src={url} className="w-full h-full object-cover" alt="Video frame" />
      </div>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
      {!isPlaying && (
        <button onClick={() => setIsPlaying(true)} className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-hydra-cyan/90 rounded-full flex items-center justify-center text-black shadow-cyan-500/50 shadow-2xl">
            <Play size={28} fill="currentColor" />
          </div>
        </button>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-600 text-[10px] font-bold text-white rounded animate-pulse">REC</div>
      <button onClick={() => downloadMedia(url, 'hydra-video')} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Download size={16} />
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-3">
      {message.isSimulatedVideo && message.video && renderVideo(message.video)}
      {message.image && !message.isSimulatedVideo && (
        <div className="relative group rounded-xl overflow-hidden border border-slate-700">
          <img src={message.image} className="w-full h-auto" alt="AI Gen" />
          <button onClick={() => downloadMedia(message.image!, 'hydra-image')} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Download size={16} />
          </button>
        </div>
      )}
      
      <div className="text-slate-200 prose prose-invert max-w-none">
        {message.text.split('```').map((part, i) => {
          if (i % 2 === 1) {
            const lines = part.split('\n');
            const lang = lines[0].trim();
            const code = lines.slice(1).join('\n').trim();
            return <CodeBlock key={i} code={code} language={lang} />;
          }
          return <p key={i} className="whitespace-pre-wrap">{part}</p>;
        })}
      </div>
    </div>
  );
};
