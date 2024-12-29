import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for user profiles
export type UserProfile = {
  id: string;
  email: string;
  user_type: 'patient' | 'advocate';
  full_name: string;
  phone_number: string;
  created_at: string;
}

// Types for advocate profiles
export type AdvocateProfile = {
  id: string;
  user_id: string;
  credentials: string;
  years_of_experience: number;
  specializations: string[];
  success_rate: number;
  total_savings_achieved: number;
  active_cases_count: number;
}

// Authentication helper functions
export const signUpUser = async (
email: string, password: string, userType: string, fullName: string, phoneNumber: string /*, userData: Omit<UserProfile, 'id' | 'created_at'>*/) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: email,
            user_type: userType,
            full_name: fullName,
            phone_number: phoneNumber
          }
        ]);

      if (profileError) throw profileError;

      // If user is an advocate, create advocate profile
      if (userType === 'advocate') {
        const { error: advocateError } = await supabase
          .from('advocates')
          .insert([
            {
              user_id: authData.user.id,
              credentials: '',
              years_of_experience: 0,
              specializations: [],
              success_rate: 0,
              total_savings_achieved: 0,
              active_cases_count: 0
            }
          ]);

        if (advocateError) throw advocateError;
      }
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (profileError) throw profileError;
    console.log('error hahah:', profileError, user, profile);
    return { user, profile, error: null };
  } catch (error) {
    return { user: null, profile: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { user, profile, error: null };
    }

    return { user: null, profile: null, error: null };
  } catch (error) {
    return { user: null, profile: null, error };
  }
};