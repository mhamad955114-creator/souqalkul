import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Shield, ArrowLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditEntry {
  id: string;
  listing_id: string;
  user_id: string;
  old_badge_type: string | null;
  new_badge_type: string | null;
  old_is_featured: boolean | null;
  new_is_featured: boolean | null;
  subscription_id: string | null;
  trigger_source: string;
  created_at: string;
  listing_title?: string;
  user_name?: string;
}

const badgeLabels: Record<string, { label: string; color: string }> = {
  business: { label: "رجال أعمال", color: "bg-amber-500 text-white" },
  professional: { label: "احترافي", color: "bg-blue-500 text-white" },
  featured: { label: "مميز", color: "bg-purple-500 text-white" },
};

const BadgeAuditLog = () => {
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("");
  const [listingFilter, setListingFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 30;

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/");
  }, [isAdmin, adminLoading, navigate]);

  const fetchEntries = async (pageNum = 0) => {
    setLoading(true);
    try {
      let query = supabase
        .from("badge_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (userFilter.trim()) {
        query = query.eq("user_id", userFilter.trim());
      }
      if (listingFilter.trim()) {
        query = query.eq("listing_id", listingFilter.trim());
      }
      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching audit log:", error);
        setEntries([]);
        return;
      }

      const rows = (data || []) as AuditEntry[];
      setHasMore(rows.length === PAGE_SIZE);

      // Enrich with listing titles and user names
      const listingIds = [...new Set(rows.map((r) => r.listing_id))];
      const userIds = [...new Set(rows.map((r) => r.user_id))];

      const [{ data: listings }, { data: profiles }] = await Promise.all([
        listingIds.length > 0
          ? supabase.from("listings").select("id, title").in("id", listingIds)
          : Promise.resolve({ data: [] }),
        userIds.length > 0
          ? supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
          : Promise.resolve({ data: [] }),
      ]);

      const titleMap = new Map((listings || []).map((l: any) => [l.id, l.title]));
      const nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));

      const enriched = rows.map((r) => ({
        ...r,
        listing_title: titleMap.get(r.listing_id) || r.listing_id.slice(0, 8),
        user_name: nameMap.get(r.user_id) || r.user_id.slice(0, 8),
      }));

      if (pageNum === 0) {
        setEntries(enriched);
      } else {
        setEntries((prev) => [...prev, ...enriched]);
      }
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchEntries(0);
  }, [isAdmin]);

  const handleSearch = () => {
    fetchEntries(0);
  };

  const clearFilters = () => {
    setUserFilter("");
    setListingFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setTimeout(() => fetchEntries(0), 0);
  };

  const renderBadge = (type: string | null) => {
    if (!type) return <span className="text-muted-foreground text-xs">بدون</span>;
    const b = badgeLabels[type];
    return b ? <Badge className={b.color}>{b.label}</Badge> : <Badge>{type}</Badge>;
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">سجل تدقيق الشارات</h1>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">فلاتر البحث</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">معرّف المستخدم</label>
                <Input
                  placeholder="UUID المستخدم..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  dir="ltr"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">معرّف الإعلان</label>
                <Input
                  placeholder="UUID الإعلان..."
                  value={listingFilter}
                  onChange={(e) => setListingFilter(e.target.value)}
                  dir="ltr"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">من تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP", { locale: ar }) : "اختر تاريخ..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">إلى تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP", { locale: ar }) : "اختر تاريخ..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                بحث
              </Button>
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الإعلان</TableHead>
                    <TableHead>الشارة السابقة</TableHead>
                    <TableHead>الشارة الجديدة</TableHead>
                    <TableHead>المصدر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && entries.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        لا توجد سجلات تدقيق
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-sm" dir="ltr">
                          {format(new Date(entry.created_at), "yyyy/MM/dd HH:mm")}
                        </TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate" title={entry.user_id}>
                          {entry.user_name}
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate" title={entry.listing_id}>
                          {entry.listing_title}
                        </TableCell>
                        <TableCell>{renderBadge(entry.old_badge_type)}</TableCell>
                        <TableCell>{renderBadge(entry.new_badge_type)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.trigger_source === "subscription_change" ? "تغيير اشتراك" : entry.trigger_source}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {hasMore && entries.length > 0 && (
              <div className="p-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchEntries(page + 1)}
                  disabled={loading}
                >
                  {loading ? "جاري التحميل..." : "تحميل المزيد"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default BadgeAuditLog;
