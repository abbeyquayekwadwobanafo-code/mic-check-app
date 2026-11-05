import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Paste your two values between the quotation marks. Only the publishable key
// goes here. Never put the secret key in this file.
const SUPABASE_URL = "https://rkcloeeoonnswszksykz.supabase.co";
const SUPABASE_KEY = "sb_publishable_Q6vuuE7Zrifet9i96DSsow_oSRAcBb_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});