import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPhone: (phone: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  resendEmailOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[0-9a-f]{8}$/i.test(ref)) localStorage.setItem("pending-ref", ref);
    } catch { /* ignore */ }

    const checkBanAndSet = async (newSession: Session | null) => {
      if (newSession?.user) {
        try {
          const pending = localStorage.getItem("pending-ref");
          if (pending) {
            localStorage.removeItem("pending-ref");
            setTimeout(() => { supabase.rpc("apply_referral", { _code: pending }); }, 0);
          }
        } catch { /* ignore */ }
        // Check if user is banned (defer to avoid deadlocks inside auth callback)
        setTimeout(async () => {
          const { data: isBanned } = await supabase.rpc("is_banned", {
            _user_id: newSession.user.id,
          });
          if (isBanned) {
            const { data: ban } = await supabase
              .from("banned_users")
              .select("reason")
              .eq("user_id", newSession.user.id)
              .maybeSingle();
            await supabase.auth.signOut();
            const { toast } = await import("sonner");
            toast.error(
              ban?.reason
                ? `حسابك معلّق. السبب: ${ban.reason}`
                : "حسابك معلّق من قبل الإدارة"
            );
            setSession(null);
            setUser(null);
          }
        }, 0);
      }
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkBanAndSet(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkBanAndSet(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // No emailRedirectTo → Supabase sends a 6-digit OTP code instead of a magic link
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    return { error };
  };

  const resendEmailOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUpWithPhone = async (phone: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signInWithPhone = async (phone: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithPhone, signUpWithPhone, resetPassword, verifyEmailOtp, resendEmailOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
