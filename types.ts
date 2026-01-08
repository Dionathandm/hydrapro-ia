
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

export interface SupportMessage {
  id: string;
  senderEmail: string;
  text: string;
  timestamp: number;
  isAdminReply: boolean;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  mediaUrl: string; // Base64 image or video
  link: string;
  isActive: boolean;
}

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
  // Marketing info
  referredBy?: string;
  source?: string;
  couponUsed?: string;
}

export interface AppConfig {
  adIntervalSeconds: number;
  ads: Ad[];
  supportMessages: SupportMessage[];
}
