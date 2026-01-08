
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  video?: string;
  isSimulatedVideo?: boolean;
  attachment?: string;
  timestamp: number;
}

export type PlanType = 'free' | 'basic' | 'premium';
export type PaymentStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  joinedDate: number;
  plan: PlanType;
  paymentStatus: PaymentStatus;
  paymentProof?: string;
  paymentSubmissionDate?: number;
  lastPaymentDate?: number;
  usageSeconds: number;
  isAdmin: boolean;
}
