import React, { useState } from 'react';
import { PlanType, User } from './types';
import { ArrowLeft, Copy, UploadCloud, CheckCircle } from 'lucide-react';
import { authService } from './storage';

interface PaymentViewProps {
  plan: PlanType;
  userEmail: string;
  onSuccess: (user?: User) => void;
  onBack: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ plan, userEmail, onSuccess, onBack }) => {
  const [proof, setProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const price = plan === 'basic' ? 'R$ 24,99' : 'R$ 299,90';
  const pixKey = "51999007349";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert('Chave Pix copiada!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProof(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!proof) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const updatedUser = authService.submitPayment(userEmail, plan, proof);
      setIsSubmitting(false);
      onSuccess(updatedUser || undefined);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-hydra-dark flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-lg bg-hydra-surface border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-hydra-panel border-b border-slate-800 p-6 flex items-center gap-4">
           <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
           <h2 className="text-lg font-bold text-white">Pagamento Seguro</h2>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex justify-between items-center">
             <div><p className="text-slate-400 text-xs uppercase">Plano</p><p className="text-xl font-bold text-white capitalize">{plan}</p></div>
             <div className="text-right"><p className="text-slate-400 text-xs uppercase">Valor</p><p className="text-xl font-bold text-hydra-cyan">{price}</p></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-slate-300 font-medium">1. Faça o Pix</h3>
            <div className="bg-black p-4 rounded-lg border border-slate-700 relative group">
              <p className="text-xs text-slate-500 mb-1">Chave Pix (PicPay)</p>
              <p className="text-white font-mono text-lg">{pixKey}</p>
              <button onClick={handleCopyPix} className="absolute right-4 top-4 p-2 bg-hydra-cyan/10 text-hydra-cyan rounded hover:bg-hydra-cyan hover:text-black"><Copy size={16} /></button>
            </div>
          </div>
          <div className="space-y-4">
             <h3 className="text-slate-300 font-medium">2. Envie o Comprovante</h3>
            {!proof ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-hydra-cyan hover:bg-hydra-cyan/5">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-sm text-slate-400">Clique para enviar imagem</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-green-500/30 bg-green-900/10 p-4 flex items-center gap-3">
                 <CheckCircle className="text-green-500" size={24} />
                 <span className="text-green-500 font-medium">Comprovante carregado</span>
                 <button onClick={() => setProof(null)} className="ml-auto text-xs text-slate-400 underline">Alterar</button>
              </div>
            )}
          </div>
          <button onClick={handleSubmit} disabled={!proof || isSubmitting} className="w-full bg-hydra-cyan text-black font-bold py-4 rounded-xl hover:bg-cyan-300 disabled:opacity-50">
            {isSubmitting ? 'Enviando...' : 'ENVIAR COMPROVANTE'}
          </button>
        </div>
      </div>
    </div>
  );
};