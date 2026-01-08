
import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Paperclip, AlertTriangle, MessageSquare, X, Megaphone, ExternalLink, Menu, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';
import { sendMessage } from './geminiService';
import { Message, User, PlanType, Ad, SupportMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { AuthScreens } from './AuthScreens';
import { PlanSelector } from './PlanSelector';
import { PaymentView } from './PaymentView';
import { AdminPanel } from './AdminPanel';
import { authService, adminService } from './storage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'splash' | 'auth' | 'plans' | 'payment' | 'chat' | 'admin' | 'blocked' | 'support'>('splash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [at, setAt] = useState<string | null>(null);
  const [usage, setUsage] = useState(0);
  const [selPlan, setSelPlan] = useState<PlanType>('free');

  const [showAd, setShowAd] = useState<Ad | null>(null);
  const [supportInput, setSupportInput] = useState('');
  const [supportChat, setSupportChat] = useState<SupportMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const FREE_MAX = 600;

  useEffect(() => {
    if (view === 'splash') setTimeout(() => setView('auth'), 1200);
  }, [view]);

  useEffect(() => {
    if (view === 'chat' && user?.plan === 'free') {
      const config = adminService.getAppConfig();
      const interval = setInterval(() => {
        setUsage(prev => {
          const next = prev + 1;
          if (next % config.adIntervalSeconds === 0 && config.ads.length > 0) {
            setShowAd(config.ads[Math.floor(Math.random() * config.ads.length)]);
          }
          if (next >= FREE_MAX) { setView('plans'); return next; }
          if (next % 10 === 0) authService.updateUsage(user.email, 10);
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [view, user]);

  useEffect(() => {
    if (user && (view === 'support' || view === 'chat')) {
      setSupportChat(adminService.getMessagesForUser(user.email));
    }
  }, [view, user]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, supportChat]);

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
    setMessages(prev => [...prev, { ...res, id: (Date.now() + 1).toString(), role: 'model', timestamp: Date.now() }]);
    setLoading(false);
  };

  if (view === 'splash') return (
    <div className="h-screen bg-hydra-dark flex flex-col items-center justify-center animate-pulse">
      <Logo size={60} />
      <div className="mt-2 font-black text-lg">HYDRA</div>
    </div>
  );

  if (view === 'auth') return <AuthScreens onLogin={onLogin} />;
  if (view === 'plans') return <PlanSelector onSelect={p => { setSelPlan(p); setView('payment'); }} onCancel={() => setView('auth')} />;
  if (view === 'payment') return <PaymentView plan={selPlan} userEmail={user?.email || ''} onSuccess={u => { if(u) setUser(u); setView('blocked'); }} onBack={() => setView('plans')} />;
  if (view === 'admin') return <AdminPanel currentUser={user!} onLogout={() => setView('auth')} />;
  if (view === 'blocked') return (
    <div className="h-screen bg-hydra-dark flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle size={48} className="text-yellow-500 mb-4" />
      <h2 className="text-xl font-bold">AGUARDANDO</h2>
      <p className="text-slate-400 mt-1 text-xs px-8">Pagamento em análise pelo administrador.</p>
      <button onClick={() => setView('auth')} className="mt-10 text-[10px] font-bold text-slate-500 uppercase">Sair</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-hydra-dark text-slate-200 safe-top safe-bottom overflow-hidden">
      <header className="h-12 border-b border-white/5 bg-hydra-panel/90 backdrop-blur-md flex items-center justify-between px-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <span className="font-bold text-xs">HYDRA</span>
        </div>
        <div className="flex items-center gap-2">
          {user?.plan === 'free' && (
            <div className="text-[8px] font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              {Math.max(0, Math.floor((FREE_MAX - usage) / 60))}:{( (FREE_MAX - usage) % 60).toString().padStart(2, '0')}
            </div>
          )}
          <button onClick={() => setView('support')} className="relative p-1 text-slate-400">
            <MessageSquare size={18} />
            {supportChat.some(m => m.isAdminReply) && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-hydra-cyan rounded-full"></span>}
          </button>
          <button onClick={() => setMessages([])} className="p-1 text-slate-500"><Trash2 size={18} /></button>
        </div>
      </header>

      {showAd && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2">
          <div className="bg-hydra-surface border border-white/10 rounded-xl overflow-hidden w-full max-w-[280px] relative">
            <button onClick={() => setShowAd(null)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full z-10"><X size={16}/></button>
            <img src={showAd.mediaUrl} className="w-full aspect-square object-cover" />
            <div className="p-3 space-y-2">
              <h3 className="font-bold text-sm">{showAd.title}</h3>
              <a href={showAd.link} target="_blank" className="block w-full bg-hydra-cyan text-black py-2 rounded-lg text-center font-bold text-xs uppercase">Saber Mais</a>
            </div>
          </div>
        </div>
      )}

      {view === 'support' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-hydra-panel h-[75vh] rounded-t-2xl border-t border-white/10 flex flex-col animate-fade-in shadow-2xl">
            <div className="h-1 w-8 bg-white/10 rounded-full mx-auto mt-2"></div>
            <div className="p-3 border-b border-white/5 flex justify-between items-center">
              <span className="font-bold text-xs">SUPORTE HYDRA</span>
              <button onClick={() => setView('chat')} className="text-slate-500"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {supportChat.map(m => (
                <div key={m.id} className={`flex ${m.isAdminReply ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl text-[11px] ${m.isAdminReply ? 'bg-slate-800' : 'bg-hydra-blue shadow-lg'}`}>{m.text}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
              <input value={supportInput} onChange={e=>setSupportInput(e.target.value)} placeholder="Dúvida..." className="flex-1 bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs outline-none" />
              <button onClick={() => { if(!supportInput) return; adminService.sendSupportMessage(user!.email, supportInput); setSupportInput(''); setSupportChat(adminService.getMessagesForUser(user!.email)); }} className="bg-hydra-cyan text-black p-2.5 rounded-xl"><Send size={18}/></button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Logo size={40} />
            <p className="text-[9px] font-bold mt-2 uppercase tracking-widest">Aguardando Comando</p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[98%] ${m.role === 'user' ? 'bg-hydra-blue text-white px-3 py-1.5 rounded-xl rounded-tr-none text-[13px]' : 'w-full'}`}>
              <MessageBubble message={m} />
            </div>
          </div>
        ))}
        {loading && <div className="text-[9px] font-bold text-hydra-cyan animate-pulse ml-2 uppercase">Core_Busy...</div>}
        <div ref={bottomRef} />
      </main>

      <footer className="p-2 bg-hydra-panel border-t border-white/5">
        <form onSubmit={onSend} className="max-w-xl mx-auto flex items-center gap-1.5">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-1 px-2 flex items-center transition-all focus-within:border-hydra-cyan min-h-[44px]">
            <button type="button" onClick={() => fileRef.current?.click()} className="p-1.5 text-slate-500"><Paperclip size={18}/></button>
            <input type="file" ref={fileRef} hidden accept="image/*" onChange={e => { const f=e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>setAt(r.result as string); r.readAsDataURL(f); } }} />
            <textarea 
              rows={1}
              value={input} 
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              placeholder="Digite..." 
              className="flex-1 bg-transparent py-2 text-[13px] outline-none resize-none max-h-24"
            />
          </div>
          <button type="submit" className="bg-hydra-cyan text-black p-2.5 rounded-xl shadow-lg active:scale-90 transition-all"><Send size={20}/></button>
        </form>
        {at && <div className="mt-1 px-2 text-[8px] text-hydra-cyan font-bold flex items-center gap-1 uppercase tracking-tighter"><Paperclip size={8"/> Mídia_Pronta.exe</div>}
      </footer>
    </div>
  );
}
