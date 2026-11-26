import { isDemoMode } from "@/shared/config/demo";
import type { UserAccount } from "@/shared/types/auth";

import * as live from "./auth-api.supabase";

const demoUser: UserAccount = { id: "demo-user", email: "demo@example.com" };

export const getCurrentUser = async (): Promise<UserAccount | null> =>
  isDemoMode ? demoUser : live.getCurrentUser();

export const signUp = async (email: string, password: string): Promise<UserAccount> =>
  isDemoMode ? demoUser : live.signUp(email, password);

export const signIn = async (email: string, password: string): Promise<UserAccount> =>
  isDemoMode ? demoUser : live.signIn(email, password);

export const signOut = async (): Promise<void> => {
  if (!isDemoMode) await live.signOut();
};
