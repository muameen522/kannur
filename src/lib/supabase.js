import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnvzxabuwkxrmqkdbeku.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yTgXPYqlTGcEi9L6WVMh6w_eLO1WbZ9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
