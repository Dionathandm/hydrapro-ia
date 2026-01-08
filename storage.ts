
import { User, PlanType } from './types';

const DB_KEY = 'hydra_users_db_master';
const ADMIN_EMAIL = 'plugplaysong@gmail.com';

const getDB = (): Record<string, User> => {
  const stored = localStorage.getItem(DB_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveDB = (db: Record<string, User>) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const db = getDB();
    const user = db[email];

    // Master Backdoor
    if (email === ADMIN_EMAIL && password === 'Ddm8545$') {
      if (!user) {
        const admin: User = {
          id: 'admin-001',
          name: 'Dionathan Martins',
          email: ADMIN_EMAIL,
          passwordHash: 'master-key',
          joinedDate: Date.now(),
          plan: 'premium',
          paymentStatus: 'approved',
          usageSeconds: 0,
          isAdmin: true
        };
        db[email] = admin;
        saveDB(db);
        return { success: true, user: admin };
      }
      return { success: true, user };
    }

    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (user.passwordHash !== password) return { success: false, error: 'Senha incorreta.' };

    return { success: true, user };
  },

  async register(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const db = getDB();
    if (db[email]) return { success: false, error: 'Este email já está em uso.' };

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      passwordHash: password,
      joinedDate: Date.now(),
      plan: 'free',
      paymentStatus: 'none',
      usageSeconds: 0,
      isAdmin: false
    };

    db[email] = newUser;
    saveDB(db);
    return { success: true, user: newUser };
  },

  updateUsage(email: string, seconds: number) {
    const db = getDB();
    if (db[email]) {
      db[email].usageSeconds = (db[email].usageSeconds || 0) + seconds;
      saveDB(db);
    }
  },

  submitPayment(email: string, plan: PlanType, proof: string): User | null {
    const db = getDB();
    const user = db[email];
    if (user) {
      user.paymentStatus = 'pending';
      user.paymentProof = proof;
      user.plan = plan;
      user.paymentSubmissionDate = Date.now();
      saveDB(db);
      return user;
    }
    return null;
  },

  getAllUsers(): User[] {
    return Object.values(getDB()).sort((a, b) => b.joinedDate - a.joinedDate);
  },

  approvePayment(email: string) {
    const db = getDB();
    if (db[email]) {
      db[email].paymentStatus = 'approved';
      db[email].lastPaymentDate = Date.now();
      saveDB(db);
    }
  },

  rejectPayment(email: string) {
    const db = getDB();
    if (db[email]) {
      db[email].paymentStatus = 'rejected';
      db[email].plan = 'free';
      db[email].paymentProof = undefined;
      saveDB(db);
    }
  },

  getBackupData(): string {
    return JSON.stringify(getDB(), null, 2);
  },

  restoreBackupData(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data && typeof data === 'object') {
        saveDB(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
