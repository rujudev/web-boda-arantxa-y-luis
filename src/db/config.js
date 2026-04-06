import { createClient } from '@supabase/supabase-js';
import { API_URL } from 'astro:env/client';
import { API_SECRET } from 'astro:env/server';

({ API_URL, API_SECRET });
export const supabaseClient = createClient(API_URL, API_SECRET);