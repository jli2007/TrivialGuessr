import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

export const supabaseClient = createClient(
  `https://${process.env.SUPABASE_CLIENT!}.supabase.co`,
  process.env.SUPABASE_ANON!,
);

export const supabaseAdmin = createClient(`https://${process.env.SUPABASE_CLIENT!}.supabase.co`, process.env.SUPABASE_SERVICE_ROLE!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})