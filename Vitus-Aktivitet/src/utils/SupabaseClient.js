import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ljjnuooeqznkowwqfnfe.supabase.co"; // 🔹 Bytt ut med din Supabase URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqam51b29lcXpua293d3FmbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjgxNTMsImV4cCI6MjA1NDI0NDE1M30.gXMtDNs6bfIysAu7Ex5uu086Kx0VQaxtWOAHyePI5k4"; // 🔹 Bytt ut med din anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
