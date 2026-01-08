import React, { useState, useEffect, useRef } from 'react';
import { User } from './types';
import { authService } from './storage';
import { Logo } from './Logo';
import { Download, Upload, Database, CheckCircle, XCircle, LogOut } from 'lucide-react';

export const AdminPanel = ({ currentUser, onLogout }: { currentUser: User, onLogout: () => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUsers(authService.getAllUsers()); }, []);

  const exportBackup = () => {
    const data = authService.getBackupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_hydrapro_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => {
        if (authService.restoreBackupData(ev.target?.result as string)) {
          alert("Dados restaurados!"); setUsers(authService.getAllUsers());
        }
      };
      r.readAsText(f);
    }
  };

  return (
    <div className="min-h-screen bg-hydra-dark">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/50">
        <div className="flex items-center gap-2"><Logo size={30} /> <span className="font-bold text-red-500">ADMIN</span></div>
        <button onClick={onLogout} className="text-slate-400 flex items-center gap-1"><LogOut size={16}/> Sair</button>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-hydra-cyan"><Database size={20}/> Gerenciar Clientes</div>
          <div className="flex gap-2">
            <button onClick={exportBackup} className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Download size={14}/> Exportar Backup</button>
            <button onClick={() => fileRef.current?.click()} className="bg-red-600/20 text-red-400 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Upload size={14}/> Restaurar</button>
            <input type="file" ref={fileRef} hidden accept=".json" onChange={importBackup} />
          </div>
        </div>

        <div className="bg-hydra-panel border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/50 text-slate-500">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className="border-t border-slate-800">
                  <td className="p-4"><div>{u.name}</div><div className="text-[10px] text-slate-500">{u.email}</div></td>
                  <td className="p-4"><span className="uppercase text-xs font-bold">{u.plan}</span></td>
                  <td className="p-4">{u.paymentStatus === 'pending' ? <span className="text-yellow-500 animate-pulse">PENDENTE</span> : u.paymentStatus}</td>
                  <td className="p-4 flex gap-2">
                    {u.paymentStatus === 'pending' && (
                      <>
                        <button onClick={() => { authService.approvePayment(u.email); setUsers(authService.getAllUsers()); }} className="text-green-500"><CheckCircle size={20}/></button>
                        <button onClick={() => { authService.rejectPayment(u.email); setUsers(authService.getAllUsers()); }} className="text-red-500"><XCircle size={20}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};