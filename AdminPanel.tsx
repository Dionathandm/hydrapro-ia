
import React, { useState, useEffect } from 'react';
import { User, Ad, SupportMessage } from './types';
import { authService, adminService } from './storage';
import { Logo } from './Logo';
import { sendMessage } from './geminiService';
import { 
  Download, CheckCircle, XCircle, LogOut, Megaphone, MessageSquare, PieChart, Trash2, Send
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
      <header className="p-3 border-b border-white/5 bg-hydra-panel flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2"><Logo size={20} /> <span className="font-bold text-red-500 text-[10px] uppercase tracking-widest">CONTROL_ADM</span></div>
        <button onClick={onLogout} className="text-slate-500"><LogOut size={18}/></button>
      </header>

      <nav className="flex bg-black p-0.5 mx-2 my-2 rounded-lg border border-white/5">
        {(['users', 'ads', 'support', 'ia'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${tab === t ? 'bg-hydra-blue text-white' : 'text-slate-500'}`}>
            {t === 'users' ? 'User' : t === 'ads' ? 'Ads' : t === 'support' ? 'Chat' : 'BI'}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto px-2 pb-16">
        {tab === 'users' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-hydra-surface p-2 rounded-lg border border-white/5"><p className="text-[8px] text-slate-500 uppercase">Total</p><p className="text-sm font-bold">{users.length}</p></div>
              <div className="bg-hydra-surface p-2 rounded-lg border border-white/5"><p className="text-[8px] text-slate-500 uppercase">Paid</p><p className="text-sm font-bold text-green-500">{users.filter(u=>u.paymentStatus==='approved').length}</p></div>
            </div>
            
            {users.map(u => (
              <div key={u.email} className="bg-hydra-surface p-3 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="truncate flex-1 pr-2">
                    <h4 className="font-bold text-[11px] truncate">{u.email}</h4>
                    <p className="text-[8px] text-slate-500 uppercase">{u.plan} • {u.source || 'DIRETO'}</p>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${u.paymentStatus === 'pending' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-400'}`}>{u.paymentStatus.toUpperCase()}</span>
                </div>
                {u.referredBy && <p className="text-[9px] text-hydra-cyan font-bold">Ref: {u.referredBy}</p>}
                
                {u.paymentStatus === 'pending' && (
                  <div className="flex gap-1 pt-1">
                    <button onClick={() => { authService.approvePayment(u.email); refresh(); }} className="flex-1 bg-green-600 text-white py-1.5 rounded-md text-[10px] font-bold">OK</button>
                    <button onClick={() => { authService.rejectPayment(u.email); refresh(); }} className="flex-1 bg-red-600 text-white py-1.5 rounded-md text-[10px] font-bold">X</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'ads' && (
          <div className="space-y-4">
            <div className="bg-hydra-surface p-3 rounded-xl border border-white/5 space-y-2">
              <input placeholder="Título" value={newAd.title} onChange={e=>setNewAd({...newAd, title: e.target.value})} className="w-full bg-black border border-white/10 p-2 rounded-lg text-xs" />
              <input placeholder="Link" value={newAd.link} onChange={e=>setNewAd({...newAd, link: e.target.value})} className="w-full bg-black border border-white/10 p-2 rounded-lg text-xs" />
              <div className="flex items-center justify-between">
                <input type="file" onChange={e => { const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setNewAd({...newAd, mediaUrl: r.result as string}); r.readAsDataURL(f);}}} className="text-[8px]" />
                <button onClick={() => { adminService.addAd(newAd); setNewAd({title:'', description:'', mediaUrl:'', link:''}); refresh(); }} className="bg-hydra-blue px-3 py-1.5 rounded-md font-bold text-[10px]">CRIAR</button>
              </div>
            </div>
            {config.ads.map(ad => (
              <div key={ad.id} className="bg-hydra-surface p-2 rounded-lg flex items-center gap-2 border border-white/5">
                <img src={ad.mediaUrl} className="w-8 h-8 object-cover rounded" />
                <div className="flex-1"><p className="text-[10px] font-bold">{ad.title}</p></div>
                <button onClick={() => { adminService.deleteAd(ad.id); refresh(); }} className="text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        )}

        {tab === 'support' && (
          <div className="space-y-3">
             {Array.from(new Set(config.supportMessages.map(m=>m.senderEmail))).map((email: string) => {
               const msgs = config.supportMessages.filter(m=>m.senderEmail === email);
               return (
                 <div key={email} className="bg-hydra-surface p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-hydra-cyan font-black mb-2">{email}</p>
                    <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                       {msgs.map(m => (
                         <div key={m.id} className={`p-1.5 rounded-lg text-[10px] ${m.isAdminReply ? 'bg-hydra-blue/10 text-right ml-4' : 'bg-black/40 mr-4'}`}>{m.text}</div>
                       ))}
                    </div>
                    <div className="flex gap-1.5">
                       <input value={supportReply[email] || ''} onChange={e => setSupportReply({...supportReply, [email]: e.target.value})} placeholder="Txt..." className="flex-1 bg-black border border-white/10 p-1.5 rounded-md text-[10px]" />
                       <button onClick={() => handleReply(email)} className="bg-hydra-cyan text-black p-1.5 rounded-md"><Send size={14}/></button>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        {tab === 'ia' && (
          <div className="space-y-3 text-center pt-4">
             <PieChart size={32} className="mx-auto text-hydra-cyan mb-1" />
             <div className="bg-black/40 p-3 rounded-lg min-h-[80px] text-[10px] text-slate-400 text-left whitespace-pre-wrap border border-white/5">
                {loadingIa ? 'Analizando...' : (iaResponse || 'Pronto.')}
             </div>
             <div className="flex gap-2">
                <input value={iaInput} onChange={e=>setIaInput(e.target.value)} placeholder="Perguntar BI..." className="flex-1 bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs" />
                <button onClick={async () => { setLoadingIa(true); const res = await sendMessage(`Responda como ADM. Contexto: ${JSON.stringify(users)}. Pergunta: ${iaInput}`); setIaResponse(res.text); setLoadingIa(false); }} className="bg-hydra-cyan text-black px-3 rounded-xl font-bold text-xs uppercase">OK</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
