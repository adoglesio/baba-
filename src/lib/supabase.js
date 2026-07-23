import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Preencha com os dados do SEU projeto Supabase (Project Settings -> API).
// NUNCA coloque a "service_role key" aqui — use sempre a "anon public key".
const SUPABASE_URL = 'https://yuwqqmdwvxuduaaqmxht.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UNlcb7V1FAXPeLflpmQJ6Q_OPDNIaaN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Garante que sempre existe um usuário (login anônimo) antes de mexer nos dados.
// Isso evita ter que criar tela de cadastro/login: cada aparelho vira "uma conta".
// Se depois você quiser permitir várias pessoas no MESMO time, dá pra trocar
// para login por e-mail (supabase.auth.signInWithPassword / signUp).
export async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
  const { data: signInData, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signInData.session;
}
