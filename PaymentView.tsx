
import React, { useState } from 'react';
import { PlanType, User } from './types';
import { ArrowLeft, Copy, UploadCloud, CheckCircle, Tag } from 'lucide-react';
import { authService } from './storage';

interface PaymentViewProps {
  plan: PlanType;
  userEmail: string;
  onSuccess: (user?: User) => void;
  onBack: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ plan, userEmail, onSuccess, onBack }) => {
  const [proof, setProof] = useState<string | null>(null);
  const [marketing, setMarketing] = useState({ source: '', creator: '', coupon: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const price = plan === 'basic' ? 'R$ 24,99' : 'R$ 299,90';
  const pixKey = "51999007349";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert('Chave Pix copiada!');
  };

  const handleSubmit = async () => {
    if (!proof || !marketing.source) {
      alert("Por favor, preencha a origem e anexe o comprovante.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const updatedUser = authService.submitPayment(userEmail, plan, proof, marketing);
      setIsSubmitting(false);
      onSuccess(updatedUser || undefined);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-hydra-dark flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto py-12">
      <div className="w-full max-w-lg bg-hydra-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-hydra-panel border-b border-slate-800 p-6 flex items-center gap-4">
           <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
           <h2 className="text-lg font-bold text-white">Finalizar Assinatura</h2>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-4 flex justify-between items-center">
             <div><p className="text-slate-400 text-xs uppercase">Plano</p><p className="text-xl font-bold text-white capitalize">{plan}</p></div>
             <div className="text-right"><p className="text-slate-400 text-xs uppercase">Valor</p><p className="text-xl font-bold text-hydra-cyan">{price}</p></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-slate-300 font-bold text-sm uppercase tracking-widest">1. Como nos conheceu?</h3>
            <select value={marketing.source} onChange={e=>setMarketing({...marketing, source: e.target.value})} className="w-full bg-black border border-slate-700 p-3 rounded-xl outline-none focus:border-hydra-cyan">
               <option value="">Selecione uma opção</option>
               <option value="TikTok">TikTok</option>
               <option value="Instagram">Instagram</option>
               <option value="YouTube">YouTube</option>
               <option value="Indicação">Indicação de Amigo</option>
               <option value="Outro">Outro</option>
            </select>
            <input placeholder="Nome do Criador/Influenciador" value={marketing.creator} onChange={e=>setMarketing({...marketing, creator: e.target.value})} className="w-full bg-black border border-slate-700 p-3 rounded-xl outline-none" />
            <div className="relative">
              <input placeholder="Cupom de Desconto" value={marketing.coupon} onChange={e=>setMarketing({...marketing, coupon: e.target.value})} className="w-full bg-black border border-slate-700 p-3 rounded-xl outline-none pl-10" />
              <Tag className="absolute left-3 top-3.5 text-slate-500" size={18} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-slate-300 font-bold text-sm uppercase tracking-widest">2. Pagamento Pix</h3>
            <div className="bg-black p-4 rounded-xl border border-slate-700 relative group">
              <p className="text-[10px] text-slate-500 mb-1">Chave Pix (PicPay)</p>
              <p className="text-white font-mono text-lg">{pixKey}</p>
              <button onClick={handleCopyPix} className="absolute right-4 top-4 p-2 bg-hydra-cyan/10 text-hydra-cyan rounded hover:bg-hydra-cyan hover:text-black"><Copy size={16} /></button>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-slate-300 font-bold text-sm uppercase tracking-widest">3. Comprovante</h3>
            {!proof ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:border-hydra-cyan transition-all">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-xs text-slate-500">Enviar Imagem do Comprovante</p>
                <input type="file" className="hidden" accept="image/*" onChange={e=>{
                  const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setProof(r.result as string); r.readAsDataURL(f);}
                }} />
              </label>
            ) : (
              <div className="bg-green-900/10 border border-green-500/30 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-2 text-green-500"><CheckCircle size={20}/> <span className="text-xs font-bold">Anexado</span></div>
                 <button onClick={()=>setProof(null)} className="text-xs text-slate-500 underline">Remover</button>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-hydra-cyan text-black font-bold py-4 rounded-2xl hover:bg-cyan-300 disabled:opacity-50">
            {isSubmitting ? 'Verificando...' : 'CONFIRMAR PAGAMENTO'}
          </button>
        </div>
      </div>
    </div>
  );
};
