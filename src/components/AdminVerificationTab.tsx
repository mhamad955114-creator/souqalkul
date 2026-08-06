import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, BadgeCheck, X, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/constants";
import VerifiedBadge from "./VerifiedBadge";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  is_verified: boolean;
  created_at: string;
}

const AdminVerificationTab = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, phone, city, is_verified, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const toggleVerification = async (profile: UserProfile) => {
    setUpdating(profile.id);
    const newStatus = !profile.is_verified;

    const { error } = await supabase.rpc("admin_set_profile_verified", {
      _user_id: profile.user_id,
      _is_verified: newStatus,
    });

    if (error) {
      toast.error("فشل في تحديث حالة التوثيق");
    } else {
      toast.success(newStatus ? "تم توثيق الحساب بنجاح ✓" : "تم إلغاء توثيق الحساب");
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_verified: newStatus } : p))
      );
    }
    setUpdating(null);
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      !search ||
      (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").includes(search) ||
      (p.city || "").includes(search);

    const matchesFilter =
      filter === "all" ||
      (filter === "verified" && p.is_verified) ||
      (filter === "unverified" && !p.is_verified);

    return matchesSearch && matchesFilter;
  });

  const verifiedCount = profiles.filter((p) => p.is_verified).length;
  const unverifiedCount = profiles.filter((p) => !p.is_verified).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("verified")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{verifiedCount}</p>
            <p className="text-sm text-muted-foreground">حسابات موثّقة</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("unverified")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{unverifiedCount}</p>
            <p className="text-sm text-muted-foreground">غير موثّقة</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو الهاتف أو المدينة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">المدينة</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {profile.full_name || "بدون اسم"}
                        {profile.is_verified && <VerifiedBadge size="sm" />}
                      </div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-left">{profile.phone || "—"}</TableCell>
                    <TableCell>{profile.city || "—"}</TableCell>
                    <TableCell>{formatDate(profile.created_at)}</TableCell>
                    <TableCell>
                      {profile.is_verified ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-1">
                          <BadgeCheck className="h-3 w-3" />
                          موثّق
                        </Badge>
                      ) : (
                        <Badge variant="secondary">غير موثّق</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={profile.is_verified ? "outline" : "default"}
                        className={!profile.is_verified ? "bg-blue-500 hover:bg-blue-600 text-white gap-1" : "gap-1"}
                        onClick={() => toggleVerification(profile)}
                        disabled={updating === profile.id}
                      >
                        {updating === profile.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : profile.is_verified ? (
                          <>
                            <UserX className="h-3 w-3" />
                            إلغاء التوثيق
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3" />
                            توثيق
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerificationTab;
