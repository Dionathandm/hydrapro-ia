import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { PlanType } from './types';

interface PlanSelectorProps {
  onSelect: (plan: PlanType) => void;
  onCancel: () => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="min-h-screen bg-hydra-dark flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Escolha seu Nível de Acesso</h2>
        <p className="text-slate-400">Libere o poder total da HydraPro IA.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-hydra-panel border border-slate-700 rounded-2xl p-8 flex flex-col hover:border-hydra-blue transition-colors group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-hydra-blue"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">BASIC</h3>
            <Zap className="text-hydra-blue" size={24} />
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">R$ 24,99</span>
            <span className="text-slate-500">/mês</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-slate-300">
            <li className="flex items-center gap-3"><Check size={18} className="text-green-500" /> Acesso à IA de Texto</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-green-500" /> Geração de Imagens</li>
          </ul>
          <button onClick={() => onSelect('basic')} className="w-full py-3 rounded-xl border border-hydra-blue text-hydra-blue font-bold hover:bg-hydra-blue hover:text-white transition-all">SELECIONAR BASIC</button>
        </div>
        <div className="bg-gradient-to-b from-slate-900 to-black border border-hydra-cyan/50 rounded-2xl p-8 flex flex-col relative transform hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hydra-cyan to-purple-500"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-hydra-cyan to-purple-400">PREMIUM</h3>
            <Star className="text-hydra-cyan" fill="currentColor" size={24} />
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">R$ 299,90</span>
            <span className="text-slate-500 block text-xs mt-1">ACESSO VITALÍCIO</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-white">
            <li className="flex items-center gap-3"><Check size={18} className="text-hydra-cyan" /> <strong>Tudo do Basic</strong></li>
            <li className="flex items-center gap-3"><Check size={18} className="text-hydra-cyan" /> Simulação de Vídeo</li>
          </ul>
          <button onClick={() => onSelect('premium')} className="w-full py-3 rounded-xl bg-gradient-to-r from-hydra-cyan to-purple-600 text-white font-bold transition-all">QUERO SER PREMIUM</button>
        </div>
      </div>
      <button onClick={onCancel} className="mt-8 text-slate-500 hover:text-white text-sm">Voltar para Login</button>
    </div>
  );
};