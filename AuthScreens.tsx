import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { authService } from './storage';
import { User } from './types';
import { Mail, Lock, ArrowRight, AlertTriangle, Download, Smartphone, X } from 'lucide-react';

export const AuthScreens = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      setShowGuide(true);
    }
  };

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const res = isReg ? await authService.register(email, pass) : await authService.login(email, pass);
    if (res.success && res.user) onLogin(res.user);
    else setErr(res.error || 'Erro na autenticação.');
  };

  return (
    <div className="min-h-screen bg-hydra-dark flex items-center justify-center p-4">
      <button onClick={handleInstall} className="absolute top-6 right-6 bg-hydra-surface border border-slate-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:border-hydra-cyan transition-all animate-pulse">
        <Download size={14} /> Baixar App
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-hydra-panel p-6 rounded-2xl border border-slate-700 max-w-xs text-center">
            <Smartphone size={40} className="mx-auto text-hydra-cyan mb-4" />
            <h3 className="font-bold mb-2">Como Instalar</h3>
            <p className="text-xs text-slate-400 mb-4">No iPhone: Toque em Compartilhar e "Adicionar à Tela de Início". No Android: Use o menu do Chrome.</p>
            <button onClick={() => setShowGuide(false)} className="w-full bg-hydra-cyan text-black py-2 rounded-lg font-bold">OK</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSub} className="w-full max-w-sm bg-hydra-surface border border-slate-800 p-8 rounded-2xl space-y-4">
        <div className="flex justify-center"><Logo size={60} /></div>
        <h2 className="text-xl font-bold text-center">{isReg ? 'Criar Conta' : 'Acesso HydraPro'}</h2>
        
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-slate-700 p-3 rounded-xl focus:border-hydra-cyan outline-none" required />
        <input type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black border border-slate-700 p-3 rounded-xl focus:border-hydra-cyan outline-none" required />
        
        {err && <div className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={14}/> {err}</div>}
        
        <button type="submit" className="w-full bg-hydra-blue py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
          {isReg ? 'CADASTRAR' : 'ENTRAR'} <ArrowRight size={18}/>
        </button>
        
        <p onClick={() => setIsReg(!isReg)} className="text-center text-slate-500 text-sm cursor-pointer hover:text-white">
          {isReg ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
        </p>
      </form>
    </div>
  );
};