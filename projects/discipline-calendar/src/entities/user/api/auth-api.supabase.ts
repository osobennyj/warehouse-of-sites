import type { Session } from "@supabase/supabase-js";

import type { UserAccount } from "@/shared/types/auth";
import { assertSupabaseConfigured, supabase } from "@/shared/api/supabase/client";

const toUserAccount = (session: Session | null): UserAccount | null => {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
  };
};

export const getCurrentUser = async (): Promise<UserAccount | null> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return toUserAccount(data.session);
};

export const signUp = async (email: string, password: string): Promise<UserAccount> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  const user = data.user;
  if (!user) {
    throw new Error("User was not created. Check email confirmation settings in Supabase.");
  }

  return {
    id: user.id,
    email: user.email ?? email,
  };
};

export const signIn = async (email: string, password: string): Promise<UserAccount> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  if (!data.user) {
    throw new Error("Failed to fetch user.");
  }

  return {
    id: data.user.id,
    email: data.user.email ?? email,
  };
};

export const signOut = async (): Promise<void> => {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};
