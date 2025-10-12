import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/contexts/ProjectContext";

const TestPayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeProject } = useProject();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [amount, setAmount] = useState("10");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to session updates
    const channel = supabase
      .channel(`test-session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSessionStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleTestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    setTesting(true);
    try {
      // Create test payment session
      const { data: session, error: sessionError } = await supabase
        .from("payment_sessions")
        .insert({
          project_id: activeProject.id,
          amount: parseFloat(amount),
          currency: "KES",
          description: "Test Payment",
          customer_phone: phoneNumber,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);
      setSessionStatus(session.status);

      // Open checkout in new tab
      const checkoutUrl = `${window.location.origin}/checkout/${session.id}`;
      window.open(checkoutUrl, '_blank');

      toast({
        title: "Test Payment Created",
        description: "Checkout page opened in new tab. Complete the payment to see real-time updates.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "failed":
      case "cancelled":
        return <Badge className="bg-destructive/10 text-destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "processing":
      case "awaiting_confirmation":
        return <Badge className="bg-warning/10 text-warning"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Payment</h1>
          <p className="text-muted-foreground">Test your payment integration in a safe environment</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Initiate Test Payment</CardTitle>
              <CardDescription>
                Create a test payment to verify your integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to enter on checkout page
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={testing}>
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Create Test Payment
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>
                Real-time status updates for your test payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!sessionId ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active test payment. Create one to see real-time updates.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Status:</span>
                    {sessionStatus ? getStatusBadge(sessionStatus) : <Badge variant="outline">Unknown</Badge>}
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Session ID:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                      {sessionId}
                    </code>
                  </div>

                  {sessionStatus === "completed" && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm font-medium text-success">
                        ✓ Payment completed successfully!
                      </p>
                    </div>
                  )}

                  {(sessionStatus === "failed" || sessionStatus === "cancelled") && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">
                        ✗ Payment {sessionStatus}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testing Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Make sure your M-Pesa configuration is set up in Payment Settings</p>
            <p>• Enable Sandbox Mode for testing with test credentials</p>
            <p>• Use Safaricom's test phone numbers for sandbox testing</p>
            <p>• Check the Transactions list in Dashboard to see completed payments</p>
            <p>• Status updates happen in real-time via Supabase subscriptions</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TestPayment;
