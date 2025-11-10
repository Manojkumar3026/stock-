import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onbvpoufakrwohwuhqou.supabase.co';

// This is your public-facing, anonymous key.
// It is safe to be exposed in a browser environment.
// For it to work, you must have Row Level Security (RLS) enabled on your tables
// and have defined policies that grant access to the 'anon' role.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnZwb3VmYWtyd29od3VocW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODk4NjIsImV4cCI6MjA3ODM2NTg2Mn0.bd-FAKh2bATnN7w7lUmRD0vqn9kyB13IEvv0BgeH1Fw';

export const supabase = createClient(supabaseUrl, supabaseKey);
