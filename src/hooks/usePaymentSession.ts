import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentSession {
  id: string;
  project_id: string;
  amount: number;
  currency: string;
  description: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
  expires_at: string;
}

interface Transaction {
  id: string;
  session_id: string;
  status: string;
  payment_method: string;
  amount: number;
  currency: string;
  created_at: string;
}

export const usePaymentSession = (sessionId: string) => {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from("payment_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (sessionError) throw sessionError;
        if (!sessionData) throw new Error("Payment session not found");

        setSession(sessionData);

        // Fetch associated transaction if exists
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (txData) {
          setTransaction(txData);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`payment-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new as PaymentSession);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setTransaction(payload.new as Transaction);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, transaction, loading, error };
};
