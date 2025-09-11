import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  `https://gfzfokghiqsqmwfchteh.supabase.co`,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemZva2doaXFzcW13ZmNodGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDM4MjgsImV4cCI6MjA3MzExOTgyOH0.VspVZnoMLpdouV7pZSD4JV-l5PwKIWGVKqzq7Nb6f8U",
);