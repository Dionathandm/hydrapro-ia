import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Trash2, Paperclip, X, Clock, AlertTriangle, Timer } from 'lucide-react';
import { Logo } from './Logo';
import { sendMessage } from './geminiService';
import { Message, User, PlanType } from './types';
import { MessageBubble } from './MessageBubble';
import { AuthScreens } from './AuthScreens';
import { PlanSelector } from './PlanSelector';
import { PaymentView } from './PaymentView';
import { AdminPanel } from './AdminPanel';
import { authService } from './storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'splash' | 'auth' | 'plans' | 'payment' | 'chat' | 'admin_panel' | 'blocked'>('splash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [usageSeconds, setUsageSeconds] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const FREE_LIMIT = 600;

  useEffect(() => {
    if (view === 'splash') setTimeout(() => setView('auth'), 2000);
  }, [view]);

  useEffect(() => {
    if (view === 'chat' && currentUser?.plan === 'free') {
      const t = setInterval(() => {
        setUsageSeconds(s => {
          if (s >= FREE_LIMIT) { setView('plans'); return s; }
          if (s % 10 === 0) authService.updateUsage(currentUser.email, 10);
          return s + 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [view, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = (u: User) => {
    setCurrentUser(u);
    setUsageSeconds(u.usageSeconds || 0);
    if (u.isAdmin) setView('admin_panel');
    else if (u.paymentStatus === 'pending') setView('blocked');
    else if (u.plan === 'free' && (u.usageSeconds || 0) >= FREE_LIMIT) setView('plans');
    else setView('chat');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachment) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, attachment: attachment || undefined, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentAt = attachment;
    setInput(''); setAttachment(null); setIsLoading(true);

    const res = await sendMessage(currentInput, currentAt || undefined);
    const botMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: res.text, 
      image: res.image, 
      video: res.video, 
      isSimulatedVideo: res.isSimulatedVideo, 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  if (view === 'splash') return (
    <div className="min-h-screen bg-hydra-dark flex flex-col items-center justify-center animate-fade-in">
      <Logo size={100} />
      <h1 className="text-3xl font-bold mt-4">HydraPro <span className="text-hydra-cyan">IA</span></h1>
    </div>
  );

  if (view === 'auth') return <AuthScreens onLogin={handleLogin} />;
  if (view === 'plans') return <PlanSelector onSelect={(p) => { setSelectedPlan(p); setView('payment'); }} onCancel={() => setView('auth')} />;
  if (view === 'payment') return <PaymentView plan={selectedPlan} userEmail={currentUser?.email || ''} onSuccess={(u) => { if(u) setCurrentUser(u); setView('blocked'); }} onBack={() => setView('plans')} />;
  if (view === 'admin_panel' && currentUser?.isAdmin) return <AdminPanel currentUser={currentUser} onLogout={() => setView('auth')} />;
  
  if (view === 'blocked') return (
    <div className="min-h-screen bg-hydra-dark flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={64} className="text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Pagamento em Análise</h2>
      <p className="text-slate-400 max-w-sm">Aguarde a liberação por um administrador. Você será avisado em breve.</p>
      <button onClick={() => setView('auth')} className="mt-6 text-hydra-cyan underline">Voltar</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-hydra-dark">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Logo size={30} onClick={() => setView('auth')} />
          <span className="font-bold">HydraPro IA</span>
        </div>
        <div className="flex items-center gap-4">
          {currentUser?.plan === 'free' && <div className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">TEMPO: {Math.floor((FREE_LIMIT - usageSeconds)/60)}m</div>}
          <button onClick={() => setMessages([])} className="text-slate-500 hover:text-red-500"><Trash2 size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-hydra-blue' : 'bg-hydra-surface border border-slate-800'}`}>
              <MessageBubble message={m} />
            </div>
          </div>
        ))}
        {isLoading && <div className="text-slate-500 text-xs animate-pulse">HydraPro está pensando...</div>}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-hydra-surface border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center max-w-4xl mx-auto">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-hydra-cyan"><Paperclip size={20}/></button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const r = new FileReader();
              r.onload = () => setAttachment(r.result as string);
              r.readAsDataURL(f);
            }
          }} />
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte qualquer coisa..." className="flex-1 bg-black border border-slate-700 rounded-xl px-4 py-2 focus:border-hydra-cyan outline-none" />
          <button type="submit" className="p-2 bg-hydra-cyan text-black rounded-full"><Send size={20}/></button>
        </form>
        {attachment && <div className="mt-2 text-[10px] text-hydra-cyan">Imagem anexada ✓</div>}
      </footer>
    </div>
  );
}