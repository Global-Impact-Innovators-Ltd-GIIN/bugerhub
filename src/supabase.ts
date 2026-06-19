import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjgzklcgdxcqnvovqmva.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_IsP_1Q3RHH3t1DNk7SIkKw_RpUwiB7K';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
