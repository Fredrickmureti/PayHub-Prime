import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchFilters {
  searchTerm: string;
  paymentMethod: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

const TransactionSearch = ({ onSearch, onClear }: TransactionSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    paymentMethod: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const emptyFilters: SearchFilters = {
      searchTerm: "",
      paymentMethod: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(emptyFilters);
    onClear();
  };

  const hasActiveFilters = filters.searchTerm || filters.paymentMethod !== "all" || 
    filters.status !== "all" || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by receipt, phone, or amount..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button onClick={handleClear} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="airtel_money">Airtel Money</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="From Date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
        />

        <Input
          type="date"
          placeholder="To Date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
        />
      </div>
    </div>
  );
};

export default TransactionSearch;
