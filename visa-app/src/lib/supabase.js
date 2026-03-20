import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bhepzcgidsvxhwomfjyx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXB6Y2dpZHN2eGh3b21manl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODAwOTMsImV4cCI6MjA4OTU1NjA5M30.f9J0Vm1Eo3l14AIshDuzH5qUfB5iklfiibAoNF93Py0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
