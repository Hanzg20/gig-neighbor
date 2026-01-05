import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Helper: Check if using mock data
export const isUsingMockData = () => {
    return import.meta.env.VITE_USE_MOCK_DATA === 'true' || !supabaseUrl;
};

// Helper: Get current user session
export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return session;
};

// Helper: Sign in with email OTP
export const signInWithEmail = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin,
        },
    });

    if (error) throw error;
    return data;
};

// Helper: Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Helper: Subscribe to auth state changes
export const onAuthStateChange = (callback: (session: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
};
