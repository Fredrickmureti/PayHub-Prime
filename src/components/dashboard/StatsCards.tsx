import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  userId?: string;
}

const StatsCards = ({ userId }: StatsCardsProps) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    successRate: 0,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, status")
        .eq("project_id", userId);

      if (transactions) {
        const completed = transactions.filter(t => t.status === "completed");
        const pending = transactions.filter(t => t.status === "pending");
        const totalRevenue = completed.reduce((sum, t) => sum + Number(t.amount), 0);
        const successRate = transactions.length > 0 
          ? (completed.length / transactions.length) * 100 
          : 0;

        setStats({
          totalRevenue,
          completedTransactions: completed.length,
          pendingTransactions: pending.length,
          successRate,
        });
      }
    };

    fetchStats();

    // Real-time updates
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `project_id=eq.${userId}`
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const cards = [
    {
      title: "Total Revenue",
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Completed",
      value: stats.completedTransactions.toString(),
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: stats.pendingTransactions.toString(),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
