import { User, PlanType } from './types';

const DB_KEY = 'hydra_users_db_v1';
const ADMIN_EMAIL = 'plugplaysong@gmail.com';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getDB = (): Record<string, User> => {
  const stored = localStorage.getItem(DB_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveDB = (db: Record<string, User>) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    const db = getDB();
    const user = db[email];

    if (email === ADMIN_EMAIL && password === 'Ddm8545$') {
      if (!user) {
        const newAdmin: User = {
          id: 'admin-master',
          name: 'Dionathan Martins',
          email: ADMIN_EMAIL,
          passwordHash: 'admin-hash',
          joinedDate: Date.now(),
          plan: 'premium',
          paymentStatus: 'approved',
          usageSeconds: 0,
          isAdmin: true
        };
        db[email] = newAdmin;
        saveDB(db);
        return { success: true, user: newAdmin };
      }
      return { success: true, user };
    }

    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (user.passwordHash !== password) return { success: false, error: 'Senha incorreta.' };

    return { success: true, user };
  },

  async register(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    const db = getDB();
    if (db[email]) return { success: false, error: 'Email já cadastrado.' };

    const newUser: User = {
      id: Date.now().toString(),
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

  updateUsage(email: string, secondsToAdd: number): User | null {
    const db = getDB();
    const user = db[email];
    if (user && !user.isAdmin) {
      user.usageSeconds = (user.usageSeconds || 0) + secondsToAdd;
      saveDB(db);
      return user;
    }
    return user || null;
  },

  submitPayment(email: string, plan: PlanType, proofBase64: string): User | null {
    const db = getDB();
    const user = db[email];
    if (user) {
      user.paymentStatus = 'pending';
      user.paymentProof = proofBase64;
      user.plan = plan;
      if (!user.paymentSubmissionDate) user.paymentSubmissionDate = Date.now();
      saveDB(db);
      return user;
    }
    return null;
  },

  getAllUsers(): User[] {
    return Object.values(getDB()).sort((a, b) => b.joinedDate - a.joinedDate);
  },

  approvePayment(email: string): User | null {
    const db = getDB();
    const user = db[email];
    if (user) {
      user.paymentStatus = 'approved';
      user.lastPaymentDate = Date.now();
      saveDB(db);
      return user;
    }
    return null;
  },

  rejectPayment(email: string): User | null {
    const db = getDB();
    const user = db[email];
    if (user) {
      user.paymentStatus = 'rejected';
      user.plan = 'free'; 
      user.paymentProof = undefined;
      user.paymentSubmissionDate = undefined;
      saveDB(db);
      return user;
    }
    return null;
  },

  getBackupData(): string {
    return JSON.stringify(getDB(), null, 2);
  },

  restoreBackupData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (typeof parsed === 'object' && parsed !== null) {
        saveDB(parsed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};