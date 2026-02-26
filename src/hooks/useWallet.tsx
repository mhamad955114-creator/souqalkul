import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  related_user_id: string | null;
  related_listing_id: string | null;
  created_at: string;
}

interface TopUpRequest {
  id: string;
  user_id: string;
  amount: number;
  transaction_number: string;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topUpRequests, setTopUpRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Run all queries in parallel
    const [walletRes, txnsRes, reqsRes] = await Promise.all([
      supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("top_up_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    // Create wallet if not exists
    let walletData = walletRes.data;
    if (!walletData && !walletRes.error) {
      const { data: newWallet } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, balance: 0 })
        .select()
        .single();
      walletData = newWallet;
    }

    if (walletData) setWallet(walletData as Wallet);
    if (txnsRes.data) setTransactions(txnsRes.data as WalletTransaction[]);
    if (reqsRes.data) setTopUpRequests(reqsRes.data as TopUpRequest[]);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const submitTopUp = async (amount: number, transactionNumber: string, receiptUrl?: string) => {
    if (!user) throw new Error("Not authenticated");
    
    const { error } = await supabase
      .from("top_up_requests")
      .insert({
        user_id: user.id,
        amount,
        transaction_number: transactionNumber,
        receipt_url: receiptUrl || null,
      });

    if (error) throw error;
    await fetchWallet();
  };

  const transferBalance = async (receiverPhone: string, amount: number) => {
    if (!user || !wallet) throw new Error("Not authenticated");
    if (amount <= 0) throw new Error("مبلغ غير صالح");
    if (wallet.balance < amount) throw new Error("رصيد غير كافٍ");

    // Find receiver by phone
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", receiverPhone)
      .maybeSingle();

    if (profileError || !profile) throw new Error("لم يتم العثور على مستخدم بهذا الرقم");
    if (profile.user_id === user.id) throw new Error("لا يمكنك التحويل لنفسك");

    const { error } = await supabase.rpc("transfer_wallet_balance", {
      _sender_id: user.id,
      _receiver_id: profile.user_id,
      _amount: amount,
    });

    if (error) throw error;
    await fetchWallet();
  };

  const payFromWallet = async (
    amount: number,
    type: string,
    description: string,
    relatedListingId?: string
  ): Promise<number> => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.rpc("process_wallet_payment", {
      _user_id: user.id,
      _amount: amount,
      _type: type,
      _description: description,
      _related_listing_id: relatedListingId || null,
    });

    if (error) throw error;
    await fetchWallet();
    return data as number;
  };

  const transferByWalletId = async (walletUserId: string, amount: number) => {
    if (!user || !wallet) throw new Error("Not authenticated");
    if (amount <= 0) throw new Error("مبلغ غير صالح");
    if (wallet.balance < amount) throw new Error("رصيد غير كافٍ");
    if (walletUserId === user.id) throw new Error("لا يمكنك التحويل لنفسك");

    // Verify receiver exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", walletUserId)
      .maybeSingle();

    if (!profile) throw new Error("عنوان المحفظة غير صالح");

    const { error } = await supabase.rpc("transfer_wallet_balance", {
      _sender_id: user.id,
      _receiver_id: walletUserId,
      _amount: amount,
    });

    if (error) throw error;
    await fetchWallet();
  };

  return {
    wallet,
    transactions,
    topUpRequests,
    loading,
    submitTopUp,
    transferBalance,
    transferByWalletId,
    payFromWallet,
    refetch: fetchWallet,
  };
}
