// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ghtritztseuszluzyzkl.supabase.co'         
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodHJpdHp0c2V1c3psdXp5emtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTM5NjAsImV4cCI6MjA2NDA4OTk2MH0.xSApaytmb9p5zc8PPtnM1rDVEqm1PvdGN8MBs0grG6U'                           // Replace this

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
