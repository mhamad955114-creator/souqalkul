import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Search, Users, ShieldAlert, BadgeCheck, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface UserRow {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  is_admin?: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
}

const AdminUsersTab = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspending, setSuspending] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone, city, country, is_verified, avatar_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("فشل تحميل المستخدمين");
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminIds = new Set(roles?.map((r) => r.user_id) || []);

    const { data: bans } = await supabase
      .from("banned_users")
      .select("user_id, reason, expires_at");

    const banMap = new Map(
      (bans || [])
        .filter((b) => !b.expires_at || new Date(b.expires_at) > new Date())
        .map((b) => [b.user_id, b.reason])
    );

    setUsers(
      (data || []).map((u) => ({
        ...u,
        is_admin: adminIds.has(u.user_id),
        is_banned: banMap.has(u.user_id),
        ban_reason: banMap.get(u.user_id) ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: deleteTarget.user_id, reason: deleteReason },
      });

      if (error || (data && (data as any).error)) {
        const msg = (data as any)?.error || error?.message || "فشل حذف الحساب";
        toast.error(msg);
        return;
      }

      toast.success("تم حذف الحساب بنجاح");
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget.user_id));
      setDeleteTarget(null);
      setDeleteReason("");
    } catch (e: any) {
      toast.error(e?.message || "خطأ غير متوقع");
    } finally {
      setDeleting(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      const action = suspendTarget.is_banned ? "unsuspend" : "suspend";
      const { data, error } = await supabase.functions.invoke("admin-suspend-user", {
        body: {
          action,
          target_user_id: suspendTarget.user_id,
          reason: suspendReason,
        },
      });

      if (error || (data && (data as any).error)) {
        const msg = (data as any)?.error || error?.message || "فشل تنفيذ العملية";
        toast.error(msg);
        return;
      }

      toast.success(suspendTarget.is_banned ? "تم إلغاء التعليق" : "تم تعليق الحساب");
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === suspendTarget.user_id
            ? { ...u, is_banned: !suspendTarget.is_banned, ban_reason: suspendTarget.is_banned ? null : suspendReason }
            : u
        )
      );
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (e: any) {
      toast.error(e?.message || "خطأ غير متوقع");
    } finally {
      setSuspending(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.city || "").toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">المستخدمين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BadgeCheck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter((u) => u.is_verified).length}</p>
              <p className="text-sm text-muted-foreground">موثّق</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Ban className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter((u) => u.is_banned).length}</p>
              <p className="text-sm text-muted-foreground">معلّق</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter((u) => u.is_admin).length}</p>
              <p className="text-sm text-muted-foreground">مدراء</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث بالاسم أو الهاتف أو المدينة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Users table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.user_id} className={u.is_banned ? "bg-orange-500/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback>
                            {(u.full_name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium text-sm">
                              {u.full_name || "—"}
                            </span>
                            {u.is_verified && (
                              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            {u.is_admin && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                مدير
                              </Badge>
                            )}
                            {u.is_banned && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-orange-500 hover:bg-orange-600">
                                معلّق
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {u.user_id.slice(0, 8)}...
                          </span>
                          {u.is_banned && u.ban_reason && (
                            <span className="text-[10px] text-orange-600 mt-0.5">
                              السبب: {u.ban_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm" dir="ltr">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {[u.city, u.country].filter(Boolean).join(" - ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant={u.is_banned ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSuspendTarget(u);
                            setSuspendReason("");
                          }}
                          disabled={u.is_admin || u.user_id === currentUser?.id}
                          title={
                            u.is_admin
                              ? "لا يمكن تعليق حساب مدير"
                              : u.user_id === currentUser?.id
                              ? "لا يمكنك تعليق حسابك"
                              : u.is_banned
                              ? "إلغاء التعليق"
                              : "تعليق الحساب"
                          }
                        >
                          {u.is_banned ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.is_admin || u.user_id === currentUser?.id}
                          title={
                            u.is_admin
                              ? "لا يمكن حذف حساب مدير"
                              : u.user_id === currentUser?.id
                              ? "لا يمكنك حذف حسابك من هنا"
                              : "حذف الحساب"
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Suspend / unsuspend confirmation */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendTarget?.is_banned ? "إلغاء تعليق الحساب؟" : "تعليق حساب المستخدم؟"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {suspendTarget?.is_banned ? (
                <span className="block">
                  سيتمكن المستخدم{" "}
                  <strong className="text-foreground">
                    {suspendTarget?.full_name || suspendTarget?.user_id}
                  </strong>{" "}
                  من تسجيل الدخول واستخدام التطبيق مجدداً.
                </span>
              ) : (
                <>
                  <span className="block">
                    سيتم تعليق حساب{" "}
                    <strong className="text-foreground">
                      {suspendTarget?.full_name || suspendTarget?.user_id}
                    </strong>{" "}
                    وتسجيل خروجه فوراً، ولن يتمكن من تسجيل الدخول أو نشر إعلانات أو إرسال رسائل.
                  </span>
                  <span className="block text-muted-foreground text-xs">
                    البيانات تبقى محفوظة - يمكن إلغاء التعليق في أي وقت.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!suspendTarget?.is_banned && (
            <div className="space-y-2">
              <label className="text-sm font-medium">سبب التعليق (اختياري):</label>
              <Textarea
                placeholder="مثال: نشر محتوى مخالف، شكاوى متعددة..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={suspending}
              className={
                suspendTarget?.is_banned
                  ? ""
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }
            >
              {suspending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : suspendTarget?.is_banned ? (
                <CheckCircle2 className="h-4 w-4 ml-2" />
              ) : (
                <Ban className="h-4 w-4 ml-2" />
              )}
              {suspendTarget?.is_banned ? "إلغاء التعليق" : "تعليق الحساب"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف حساب المستخدم نهائياً؟</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                سيتم حذف الحساب{" "}
                <strong className="text-foreground">
                  {deleteTarget?.full_name || deleteTarget?.user_id}
                </strong>{" "}
                وجميع بياناته نهائياً (الإعلانات، الرسائل، التقييمات، المحفظة، الإشعارات).
              </span>
              <span className="block text-destructive font-medium">
                هذا الإجراء لا يمكن التراجع عنه.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">سبب الحذف (اختياري - للسجل):</label>
            <Textarea
              placeholder="مثال: مخالفة قوانين النشر، محتوى مسيء..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <Trash2 className="h-4 w-4 ml-2" />
              )}
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersTab;
