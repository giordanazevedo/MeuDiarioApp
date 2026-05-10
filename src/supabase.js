import { createClient } from '@supabase/supabase-js';

// Sua URL baseada no ID do projeto da imagem
const supabaseUrl = 'https://bhiepahnmoxxcmdyykdy.supabase.co'; 

// Você encontra esta chave no menu lateral: Configurações -> API -> anon public
const supabaseAnonKey = 'sb_publishable_161xCeusuMIGHOtEHCRwuw_7d2lMvWb'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

