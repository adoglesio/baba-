import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// O Expo injeta automaticamente qualquer variável que comece com EXPO_PUBLIC_
// (tanto no app quanto na versão web) — não precisa de configuração extra.
// Se as variáveis não existirem (ex: esqueceu de configurar), cai nos valores
// de exemplo abaixo, só pra deixar claro que falta configurar.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kbvftfmjcslqvezxxmqt.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YZOW3gphyZWubGSddLbz6g_9PkXqLUw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
