
import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Paperclip, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'splash' | 'auth' | 'plans' | 'payment' | 'chat' | 'admin' | 'blocked'>('splash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [at, setAt] = useState<string | null>(null);
  const [usage, setUsage] = useState(0);
  const [selPlan, setSelPlan] = useState<PlanType>('free');

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const FREE_MAX = 600;

  useEffect(() => {
    if (view === 'splash') setTimeout(() => setView('auth'), 2000);
  }, [view]);

  useEffect(() => {
    if (view === 'chat' && user?.plan === 'free') {
      const t = setInterval(() => {
        setUsage(prev => {
          if (prev >= FREE_MAX) { setView('plans'); return prev; }
          if (prev % 10 === 0) authService.updateUsage(user.email, 10);
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [view, user]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const onLogin = (u: User) => {
    setUser(u);
    setUsage(u.usageSeconds || 0);
    if (u.isAdmin) setView('admin');
    else if (u.paymentStatus === 'pending') setView('blocked');
    else if (u.plan === 'free' && (u.usageSeconds || 0) >= FREE_MAX) setView('plans');
    else setView('chat');
  };

  const onSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !at) return;

    const uMsg: Message = { id: Date.now().toString(), role: 'user', text: input, attachment: at || undefined, timestamp: Date.now() };
    setMessages(prev => [...prev, uMsg]);
    const ci = input; const ca = at;
    setInput(''); setAt(null); setLoading(true);

    const res = await sendMessage(ci, ca || undefined);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: res.text,
      image: res.image,
      video: res.video,
      isSimulatedVideo: res.isSimulatedVideo,
      timestamp: Date.now()
    }]);
    setLoading(false);
  };

  if (view === 'splash') return (
    <div className="h-screen bg-hydra-dark flex flex-col items-center justify-center animate-fade-in">
      <Logo size={120} className="drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
      <h1 className="text-4xl font-black mt-6 tracking-tighter">HYDRA<span className="text-hydra-cyan">PRO</span></h1>
    </div>
  );

  if (view === 'auth') return <AuthScreens onLogin={onLogin} />;
  if (view === 'plans') return <PlanSelector onSelect={p => { setSelPlan(p); setView('payment'); }} onCancel={() => setView('auth')} />;
  if (view === 'payment') return <PaymentView plan={selPlan} userEmail={user?.email || ''} onSuccess={u => { if(u) setUser(u); setView('blocked'); }} onBack={() => setView('plans')} />;
  if (view === 'admin') return <AdminPanel currentUser={user!} onLogout={() => setView('auth')} />;
  
  if (view === 'blocked') return (
    <div className="h-screen bg-hydra-dark flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-yellow-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">ANÁLISE DE PAGAMENTO</h2>
      <p className="text-slate-400 max-w-xs text-sm">O seu comprovante foi enviado. Aguarde alguns minutos para que o administrador libere o acesso.</p>
      <button onClick={() => setView('auth')} className="mt-8 text-hydra-cyan font-bold uppercase tracking-widest text-xs">SAIR DO SISTEMA</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-hydra-dark text-slate-200">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-black text-sm tracking-widest">HYDRA<span className="text-hydra-cyan">PRO</span></span>
        </div>
        <div className="flex items-center gap-4">
          {user?.plan === 'free' && (
            <div className="text-[10px] font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              TEMPO: {Math.max(0, Math.floor((FREE_MAX - usage) / 60))}:{((FREE_MAX - usage) % 60).toString().padStart(2, '0')}
            </div>
          )}
          <button onClick={() => setMessages([])} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[90%] md:max-w-[70%] ${m.role === 'user' ? '' : 'w-full'}`}>
              <MessageBubble message={m} />
            </div>
          </div>
        ))}
        {loading && <div className="text-hydra-cyan text-[10px] font-bold animate-pulse tracking-widest">HYDRAPRO_IA_PROCESSANDO...</div>}
        <div ref={bottomRef} />
      </main>

      <footer className="p-4 bg-hydra-surface border-t border-slate-800">
        <form onSubmit={onSend} className="max-w-4xl mx-auto relative group">
          <div className="flex items-center gap-2 bg-black border border-slate-700 rounded-2xl p-1 px-3 group-focus-within:border-hydra-cyan transition-colors">
            <button type="button" onClick={() => fileRef.current?.click()} className="p-2 text-slate-500 hover:text-hydra-cyan"><Paperclip size={20}/></button>
            <input type="file" ref={fileRef} hidden accept="image/*" onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                const r = new FileReader();
                r.onload = () => setAt(r.result as string);
                r.readAsDataURL(f);
              }
            }} />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Comando HydraPro..." className="flex-1 bg-transparent py-3 text-sm outline-none" />
            <button type="submit" className="p-2 bg-hydra-cyan text-black rounded-xl shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95 transition-all"><Send size={20}/></button>
          </div>
          {at && <div className="absolute -top-4 left-4 text-[10px] text-hydra-cyan font-bold bg-black px-2 py-0.5 rounded border border-hydra-cyan/30">MÍDIA_ANEXADA.EXE</div>}
        </form>
      </footer>
    </div>
  );
}
