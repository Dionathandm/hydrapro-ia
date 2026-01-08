
import React, { useState, useEffect } from 'react';
import { User, Ad, SupportMessage } from './types';
import { authService, adminService } from './storage';
import { Logo } from './Logo';
import { sendMessage } from './geminiService';
import { 
  Download, Upload, CheckCircle, XCircle, LogOut, Database, 
  RefreshCcw, Megaphone, MessageSquare, PieChart, Plus, Trash2, Send, Filter
} from 'lucide-react';

export const AdminPanel: React.FC<{ currentUser: User, onLogout: () => void }> = ({ onLogout }) => {
  const [tab, setTab] = useState<'users' | 'ads' | 'support' | 'ia'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState(adminService.getAppConfig());
  const [iaInput, setIaInput] = useState('');
  const [iaResponse, setIaResponse] = useState('');
  const [loadingIa, setLoadingIa] = useState(false);
  const [supportReply, setSupportReply] = useState<Record<string, string>>({});
  const [newAd, setNewAd] = useState({ title: '', description: '', mediaUrl: '', link: '' });

  const refresh = () => {
    setUsers(authService.getAllUsers());
    setConfig(adminService.getAppConfig());
  };

  useEffect(refresh, []);

  const handleReply = (email: string) => {
    if (!supportReply[email]) return;
    adminService.sendSupportMessage(email, supportReply[email], true);
    setSupportReply({ ...supportReply, [email]: '' });
    refresh();
  };

  return (
    <div className="min-h-screen bg-hydra-dark text-slate-200 safe-top safe-bottom flex flex-col">
      <header className="p-4 border-b border-white/5 bg-hydra-panel flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2"><Logo size={24} /> <span className="font-bold text-red-500 text-xs uppercase tracking-widest">ADM</span></div>
        <button onClick={onLogout} className="text-slate-500"><LogOut size={20}/></button>
      </header>

      <nav className="flex bg-black p-1 mx-4 my-4 rounded-xl border border-white/5">
        {(['users', 'ads', 'support', 'ia'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${tab === t ? 'bg-hydra-blue text-white shadow-lg' : 'text-slate-500'}`}>
            {t === 'users' ? 'Clientes' : t === 'ads' ? 'Anúncios' : t === 'support' ? 'Suporte' : 'BI'}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto px-4 pb-20">
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-hydra-surface p-3 rounded-xl border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Total</p><p className="text-xl font-bold">{users.length}</p></div>
              <div className="bg-hydra-surface p-3 rounded-xl border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Pagantes</p><p className="text-xl font-bold text-green-500">{users.filter(u=>u.paymentStatus==='approved').length}</p></div>
            </div>
            
            {users.map(u => (
              <div key={u.email} className="bg-hydra-surface p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm truncate w-40">{u.email}</h4>
                    <p className="text-[10px] text-slate-500 uppercase">{u.plan} • {u.source || 'DIRETO'}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${u.paymentStatus === 'pending' ? 'bg-yellow-500 text-black animate-pulse' : 'bg-white/10'}`}>{u.paymentStatus.toUpperCase()}</span>
                </div>
                {u.referredBy && <p className="text-[10px] text-hydra-cyan font-bold italic">Criador: {u.referredBy} {u.couponUsed && `(Cupom: ${u.couponUsed})`}</p>}
                
                {u.paymentStatus === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { authService.approvePayment(u.email); refresh(); }} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"><CheckCircle size={14}/> APROVAR</button>
                    <button onClick={() => { authService.rejectPayment(u.email); refresh(); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"><XCircle size={14}/> RECUSAR</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-hydra-surface p-4 rounded-2xl border border-white/5 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><Megaphone size={16} className="text-hydra-cyan"/> NOVO ANÚNCIO</h3>
              <input placeholder="Título" value={newAd.title} onChange={e=>setNewAd({...newAd, title: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm" />
              <input placeholder="Link" value={newAd.link} onChange={e=>setNewAd({...newAd, link: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm" />
              <div className="flex items-center justify-between gap-4">
                <input type="file" onChange={e => { const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setNewAd({...newAd, mediaUrl: r.result as string}); r.readAsDataURL(f);}}} className="text-[10px]" />
                <button onClick={() => { adminService.addAd(newAd); setNewAd({title:'', description:'', mediaUrl:'', link:''}); refresh(); }} className="bg-hydra-blue px-6 py-2 rounded-xl font-bold text-xs">CRIAR</button>
              </div>
            </div>
            <div className="space-y-2">
              {config.ads.map(ad => (
                <div key={ad.id} className="bg-hydra-surface p-3 rounded-xl flex items-center gap-3 border border-white/5">
                  <img src={ad.mediaUrl} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1"><p className="text-xs font-bold">{ad.title}</p></div>
                  <button onClick={() => { adminService.deleteAd(ad.id); refresh(); }} className="text-red-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'support' && (
          <div className="space-y-4">
             {Array.from(new Set(config.supportMessages.map(m=>m.senderEmail))).map((email: string) => {
               const msgs = config.supportMessages.filter(m=>m.senderEmail === email);
               return (
                 <div key={email} className="bg-hydra-surface p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-hydra-cyan font-black mb-3">{email}</p>
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                       {msgs.map(m => (
                         <div key={m.id} className={`p-2 rounded-xl text-[10px] ${m.isAdminReply ? 'bg-hydra-blue/20 ml-6 text-right' : 'bg-black/40 mr-6'}`}>{m.text}</div>
                       ))}
                    </div>
                    <div className="flex gap-2">
                       <input value={supportReply[email] || ''} onChange={e => setSupportReply({...supportReply, [email]: e.target.value})} placeholder="Resposta..." className="flex-1 bg-black border border-white/10 p-2 rounded-lg text-xs" />
                       <button onClick={() => handleReply(email)} className="bg-hydra-cyan text-black p-2 rounded-lg"><Send size={16}/></button>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        {tab === 'ia' && (
          <div className="space-y-4 py-8 text-center">
             <PieChart size={48} className="mx-auto text-hydra-cyan mb-2" />
             <h3 className="font-bold">IA BI MASTER</h3>
             <div className="bg-black/40 p-4 rounded-xl min-h-24 text-xs text-slate-400 text-left whitespace-pre-wrap border border-white/5">
                {loadingIa ? 'Sincronizando dados...' : (iaResponse || 'Pronto para analisar métricas.')}
             </div>
             <div className="flex gap-2">
                <input value={iaInput} onChange={e=>setIaInput(e.target.value)} placeholder="Ex: Melhores cupons?" className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none" />
                <button onClick={async () => { setLoadingIa(true); const res = await sendMessage(`Responda como ADM Hydra Control. Contexto: ${JSON.stringify(users)}. Pergunta: ${iaInput}`); setIaResponse(res.text); setLoadingIa(false); }} className="bg-hydra-cyan text-black px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-tighter">OK</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
