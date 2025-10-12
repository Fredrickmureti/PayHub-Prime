import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, AlertCircle, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TransactionSearch, { SearchFilters } from "./TransactionSearch";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  customer_phone: string | null;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: string;
  status: string;
  provider_reference: string | null;
  receipt_number: string | null;
  transaction_timestamp: string | null;
  verification_status: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
}

interface TransactionsListProps {
  userId?: string;
}

const TransactionsList = ({ userId }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("project_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setTransactions(data);
        setFilteredTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();

    // Real-time updates
    const channel = supabase
      .channel('transactions-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `project_id=eq.${userId}`
        },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success hover:bg-success/20";
      case "pending":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      case "failed":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      mpesa: "M-Pesa",
      airtel_money: "Airtel Money",
      paypal: "PayPal",
      credit_card: "Credit Card",
    };
    return labels[method] || method;
  };

  const getVerificationBadge = (status: string | null) => {
    if (!status || status === 'pending') return null;
    
    const configs = {
      verified: { icon: CheckCircle, color: "bg-success/10 text-success", label: "Verified" },
      mismatched: { icon: AlertCircle, color: "bg-warning/10 text-warning", label: "Mismatched" },
      unverified: { icon: XCircle, color: "bg-muted text-muted-foreground", label: "Unverified" },
    };

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleSearch = (filters: SearchFilters) => {
    let filtered = [...transactions];

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.receipt_number?.toLowerCase().includes(term) ||
        t.customer_phone?.toLowerCase().includes(term) ||
        t.customer_email?.toLowerCase().includes(term) ||
        t.amount.toString().includes(term) ||
        t.id.toLowerCase().includes(term)
      );
    }

    // Payment method
    if (filters.paymentMethod !== "all") {
      filtered = filtered.filter(t => t.payment_method === filters.paymentMethod);
    }

    // Status
    if (filters.status !== "all") {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(filters.dateTo));
    }

    setFilteredTransactions(filtered);
  };

  const handleClearSearch = () => {
    setFilteredTransactions(transactions);
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      setTransactions(transactions.filter((t) => t.id !== id));
      setFilteredTransactions(filteredTransactions.filter((t) => t.id !== id));
      if (selectedTransaction?.id === id) {
        setSelectedTransaction(null);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TransactionSearch onSearch={handleSearch} onClear={handleClearSearch} />
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Configure your payment methods to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedTransaction(transaction)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">
                          {transaction.customer_name || transaction.customer_phone || transaction.customer_email || "Unknown"}
                        </p>
                        {transaction.receipt_number && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Receipt className="h-3 w-3" />
                            {transaction.receipt_number.substring(0, 12)}...
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(transaction.payment_method)} •{" "}
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {transaction.currency} {Number(transaction.amount).toLocaleString()}
                    </p>
                    {getVerificationBadge(transaction.verification_status)}
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTransaction(transaction.id);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                    {getVerificationBadge(selectedTransaction.verification_status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">{selectedTransaction.currency} {Number(selectedTransaction.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>{getPaymentMethodLabel(selectedTransaction.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p>{selectedTransaction.customer_name || selectedTransaction.customer_phone || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
                {selectedTransaction.receipt_number && (
                  <div className="col-span-2 p-4 bg-success/5 rounded-lg border border-success/20">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-success" />
                      Receipt Number
                    </p>
                    <p className="font-mono text-lg font-semibold text-success">{selectedTransaction.receipt_number}</p>
                  </div>
                )}
                {selectedTransaction.transaction_timestamp && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Time</p>
                    <p>{new Date(selectedTransaction.transaction_timestamp).toLocaleString()}</p>
                  </div>
                )}
                {selectedTransaction.provider_reference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Provider Reference</p>
                    <p className="font-mono text-sm">{selectedTransaction.provider_reference}</p>
                  </div>
                )}
                {selectedTransaction.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{selectedTransaction.description}</p>
                  </div>
                )}
              </div>
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TransactionsList;
