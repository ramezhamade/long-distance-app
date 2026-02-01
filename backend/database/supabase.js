const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - set these environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  console.error('Please set them in your .env file or environment');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;