// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ieqlswwdfobuuahxyowh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcWxzd3dkZm9idXVhaHh5b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTU2MTQsImV4cCI6MjA2NjE3MTYxNH0.kVfRidaDIH-uABmkbWf7yr0YlZmRkbtOuGFnN2KePFI
';
export const supabase = createClient(supabaseUrl, supabaseKey);
