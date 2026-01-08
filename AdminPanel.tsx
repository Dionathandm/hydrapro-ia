
import React, { useState, useEffect, useRef } from 'react';
import { User } from './types';
import { authService } from './storage';
import { Logo } from './Logo';
import { Download, Upload, CheckCircle, XCircle, LogOut, Database, RefreshCcw } from 'lucide-react';

export const AdminPanel: React.FC<{ currentUser: User, onLogout: () => void }> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setUsers(authService.getAllUsers());
  useEffect(refresh, []);

  const exportDB = () => {
    const data = authService.getBackupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydra_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
  };

  const importDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (authService.restoreBackupData(ev.target?.result as string)) {
          alert("Base de dados restaurada!");
          refresh();
        } else {
          alert("Falha ao ler o arquivo de backup.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-hydra-dark text-slate-200">
      <header className="p-4 border-b border-slate-800 bg-hydra-panel flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3"><Logo size={32} /> <span className="font-bold text-red-500">ADMIN PANEL</span></div>
        <button onClick={onLogout} className="text-slate-400 hover:text-white flex items-center gap-1"><LogOut size={18}/> Sair</button>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-hydra-surface p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-slate-500 text-xs font-bold uppercase flex items-center gap-2"><Database size={14} className="text-hydra-cyan"/> Gestão de Dados</h3>
            <div className="flex flex-col gap-2">
              <button onClick={exportDB} className="bg-hydra-blue/20 text-hydra-blue border border-hydra-blue/50 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-hydra-blue hover:text-white transition-all">
                <Download size={14}/> EXPORTAR BACKUP JSON
              </button>
              <button onClick={() => fileRef.current?.click()} className="bg-slate-800 text-slate-300 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                <Upload size={14}/> IMPORTAR BACKUP JSON
              </button>
              <input type="file" ref={fileRef} hidden accept=".json" onChange={importDB} />
            </div>
          </div>

          <div className="md:col-span-2 bg-hydra-surface rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold">Clientes ({users.length})</span>
              <button onClick={refresh} className="text-slate-500 hover:text-hydra-cyan"><RefreshCcw size={16}/></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/40 text-slate-500">
                  <tr>
                    <th className="p-4">Email</th>
                    <th className="p-4">Plano</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email} className="border-t border-slate-800 hover:bg-white/5">
                      <td className="p-4">
                        <div className="font-medium text-white">{u.email}</div>
                        <div className="text-[10px] text-slate-500">Cadastrado em: {new Date(u.joinedDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4"><span className="text-[10px] font-bold uppercase bg-slate-800 px-2 py-1 rounded">{u.plan}</span></td>
                      <td className="p-4">
                        {u.paymentStatus === 'pending' ? <span className="text-yellow-500 font-bold animate-pulse">PENDENTE</span> : u.paymentStatus}
                      </td>
                      <td className="p-4">
                        {u.paymentStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => { authService.approvePayment(u.email); refresh(); }} className="p-1.5 bg-green-900/30 text-green-500 rounded border border-green-500/30"><CheckCircle size={16}/></button>
                            <button onClick={() => { authService.rejectPayment(u.email); refresh(); }} className="p-1.5 bg-red-900/30 text-red-500 rounded border border-red-500/30"><XCircle size={16}/></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
