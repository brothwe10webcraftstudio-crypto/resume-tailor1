import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro';
  stripe_customer_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type UsageRecord = {
  id: string;
  user_id: string;
  month_year: string;
  tailor_count: number;
  created_at: string;
};

export type TailoredResume = {
  id: string;
  user_id: string;
  job_description: string;
  original_resume: string;
  tailored_resume: string;
  created_at: string;
};
