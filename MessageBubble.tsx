
import React, { useState } from 'react';
import { Message } from './types';
import { CodeBlock } from './CodeBlock';
import { Download, Play, ShieldAlert } from 'lucide-react';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  if (isUser) {
    return (
      <div className="flex flex-col items-end w-full animate-fade-in">
        {message.attachment && (
          <img src={message.attachment} className="w-32 rounded-xl mb-1 border border-white/10 shadow-lg" alt="Upload" />
        )}
        <div className="bg-hydra-blue text-white px-3 py-2 rounded-2xl rounded-tr-none text-sm shadow-md leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  const renderVideo = (url: string) => (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black group shadow-xl mb-3">
      <div className={`absolute inset-0 transition-transform duration-[10000ms] ease-in-out ${isPlaying ? 'scale-125' : 'scale-100'}`}>
        <img src={url} className="w-full h-full object-cover opacity-80" alt="Frame" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      {!isPlaying && (
        <button onClick={() => setIsPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="w-14 h-14 bg-hydra-cyan text-black rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            <Play size={24} fill="currentColor" />
          </div>
        </button>
      )}
      <div className="absolute bottom-2 left-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">High Fidelity Simulation</span>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-2 animate-fade-in">
      {message.isSimulatedVideo && message.video && renderVideo(message.video)}
      
      {message.image && !message.isSimulatedVideo && (
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-2">
          <img src={message.image} className="w-full h-auto" alt="AI Gen" />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur p-2 rounded-full border border-white/10">
            <Download size={14} className="text-white" onClick={() => { const a=document.createElement('a'); a.href=message.image!; a.download=`hydra-${Date.now()}.png`; a.click(); }} />
          </div>
        </div>
      )}
      
      <div className="text-slate-200 text-sm leading-relaxed space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
        {message.text.split('```').map((part, i) => {
          if (i % 2 === 1) {
            const lines = part.split('\n');
            const code = lines.slice(1).join('\n').trim();
            return <CodeBlock key={i} code={code} language={lines[0].trim()} />;
          }
          return <p key={i} className="whitespace-pre-wrap">{part}</p>;
        })}
      </div>
    </div>
  );
};
