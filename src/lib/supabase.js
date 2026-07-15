import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnvzxabuwkxrmqkdbeku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxudnp4YWJ1d2t4cm1xa2RiZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMDMyODEsImV4cCI6MjA5OTY3OTI4MX0.sFlamZukzvh9V5gVmtqcuv0sBqt3OkRVjFeNex-vHbE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
