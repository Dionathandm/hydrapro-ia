
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { authService } from './storage';
import { User } from './types';
import { Mail, Lock, ArrowRight, AlertTriangle, Download, Smartphone } from 'lucide-react';

export const AuthScreens: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
    } else {
      setShowIosGuide(true);
    }
  };

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const res = isReg ? await authService.register(email, pass) : await authService.login(email, pass);
    if (res.success && res.user) onLogin(res.user);
    else setErr(res.error || 'Erro de autenticação.');
  };

  return (
    <div className="min-h-screen bg-hydra-dark flex items-center justify-center p-6">
      <button onClick={handleInstall} className="absolute top-6 right-6 flex items-center gap-2 bg-hydra-panel border border-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 animate-pulse hover:border-hydra-cyan transition-colors">
        <Download size={14} /> BAIXAR APP
      </button>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setShowIosGuide(false)}>
          <div className="bg-hydra-panel p-8 rounded-2xl border border-slate-700 text-center space-y-4 max-w-xs">
            <Smartphone size={48} className="text-hydra-cyan mx-auto" />
            <h3 className="text-xl font-bold">Instalar no iPhone</h3>
            <p className="text-sm text-slate-400">1. Toque no ícone de compartilhar (quadrado com seta).<br/>2. Role para baixo e toque em 'Adicionar à Tela de Início'.</p>
            <button className="w-full bg-hydra-cyan text-black py-2 rounded-lg font-bold">ENTENDI</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSub} className="w-full max-w-sm bg-hydra-surface border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex justify-center"><Logo size={64} /></div>
        <h2 className="text-2xl font-bold text-center">{isReg ? 'Nova Conta Hydra' : 'Acesso HydraPro'}</h2>
        
        <div className="space-y-4">
          <input type="email" placeholder="Seu email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-slate-700 p-3 rounded-xl focus:border-hydra-cyan outline-none transition-colors" />
          <input type="password" placeholder="Sua senha" required value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black border border-slate-700 p-3 rounded-xl focus:border-hydra-cyan outline-none transition-colors" />
        </div>

        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={14} /> {err}</p>}

        <button type="submit" className="w-full bg-hydra-blue py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
          {isReg ? 'CADASTRAR AGORA' : 'ENTRAR NO SISTEMA'} <ArrowRight size={18} />
        </button>

        <p onClick={() => setIsReg(!isReg)} className="text-center text-slate-500 text-sm cursor-pointer hover:text-white transition-colors">
          {isReg ? 'Já possui conta? Faça login' : 'Ainda não tem acesso? Crie uma conta'}
        </p>
      </form>
    </div>
  );
};
