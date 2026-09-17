export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: 'ROLE_OWNER' | 'ROLE_CUSTOMER';
}

export interface PausePeriod {
  id: number;
  startDate: string;
  endDate?: string;
  reason?: string;
  resumedAt?: string;
  active: boolean;
}

export interface Subscription {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  planType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  monthlyPrice: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  notes?: string;
  currentPause?: PausePeriod;
  pauseHistory?: PausePeriod[];
}

export interface BillResponse {
  subscriptionId: number;
  customerName: string;
  customerPhone: string;
  planType: string;
  monthlyPrice: number;
  year: number;
  month: number;
  monthName: string;
  totalWeekdays: number;
  pausedWeekdays: number;
  deliveredWeekdays: number;
  dailyRate: number;
  totalAmount: number;
  pauseDetails: {
    startDate: string;
    endDate: string;
    reason: string;
    weekdaysPaused: number;
  }[];
}

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  todayDeliveries: number;
  monthlyRevenueEstimate: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
}
