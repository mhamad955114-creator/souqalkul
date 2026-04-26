import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Settings2,
  EyeOff,
  ListFilter,
} from "lucide-react";
import type { MetadataField } from "@/lib/constants";
import {
  useCategoryDefinitions,
  type CategoryDefinition,
} from "@/hooks/useCategoryDefinitions";
import { useAdminRole } from "@/hooks/useAdminRole";

const UNAUTHORIZED_MSG = "غير مصرّح: هذه العملية متاحة للمشرفين فقط.";

const getFriendlyError = (error: { code?: string; message?: string } | null): string => {
  if (!error) return "حدث خطأ غير متوقع";
  const msg = (error.message || "").toLowerCase();
  if (
    error.code === "42501" ||
    msg.includes("row-level security") ||
    msg.includes("row level security") ||
    msg.includes("permission denied") ||
    msg.includes("violates") && msg.includes("policy")
  ) {
    return UNAUTHORIZED_MSG;
  }
  return error.message || "حدث خطأ غير متوقع";
};

type FieldFormState = {
  key: string;
  label: string;
  type: "text" | "select";
  optionsText: string;
};

const emptyFieldForm: FieldFormState = {
  key: "",
  label: "",
  type: "text",
  optionsText: "",
};

const AdminCategoriesTab = () => {
  const { definitions, loading, refresh } = useCategoryDefinitions();
  const { isAdmin, loading: roleLoading } = useAdminRole();

  const guardAdmin = (): boolean => {
    if (!isAdmin) {
      toast.error(UNAUTHORIZED_MSG);
      return false;
    }
    return true;
  };
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // dialogs
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catEditing, setCatEditing] = useState<CategoryDefinition | null>(null);
  const [catForm, setCatForm] = useState({ category_key: "", label: "", is_active: true });
  const [savingCat, setSavingCat] = useState(false);

  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [fieldEditingIndex, setFieldEditingIndex] = useState<number | null>(null);
  const [fieldForm, setFieldForm] = useState<FieldFormState>(emptyFieldForm);

  const [hideRuleDialogOpen, setHideRuleDialogOpen] = useState(false);
  const [hideRuleForm, setHideRuleForm] = useState({
    triggerKey: "",
    triggerValue: "",
    hiddenFieldsText: "",
  });

  const [optionFilterDialogOpen, setOptionFilterDialogOpen] = useState(false);
  const [optionFilterForm, setOptionFilterForm] = useState({
    targetKey: "",
    triggerKey: "",
    triggerValue: "",
    allowedOptionsText: "",
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    type: "category" | "field" | "hideRule" | "optionFilter";
    payload: any;
  } | null>(null);

  useEffect(() => {
    if (!selectedKey && definitions.length > 0) {
      setSelectedKey(definitions[0].category_key);
    }
  }, [definitions, selectedKey]);

  const selected = definitions.find((d) => d.category_key === selectedKey) || null;

  // ============== Category CRUD ==============
  const openNewCategory = () => {
    setCatEditing(null);
    setCatForm({ category_key: "", label: "", is_active: true });
    setCatDialogOpen(true);
  };

  const openEditCategory = (def: CategoryDefinition) => {
    setCatEditing(def);
    setCatForm({ category_key: def.category_key, label: def.label, is_active: def.is_active });
    setCatDialogOpen(true);
  };

  const saveCategory = async () => {
    if (!catForm.category_key.trim() || !catForm.label.trim()) {
      toast.error("يرجى ملء المفتاح والاسم");
      return;
    }
    setSavingCat(true);
    if (catEditing) {
      const { error } = await supabase
        .from("category_definitions")
        .update({
          category_key: catForm.category_key.trim(),
          label: catForm.label.trim(),
          is_active: catForm.is_active,
        })
        .eq("id", catEditing.id);
      setSavingCat(false);
      if (error) {
        toast.error("فشل حفظ التصنيف: " + getFriendlyError(error));
        return;
      }
      toast.success("تم تحديث التصنيف");
    } else {
      const maxOrder = Math.max(0, ...definitions.map((d) => d.display_order));
      const { error } = await supabase.from("category_definitions").insert({
        category_key: catForm.category_key.trim(),
        label: catForm.label.trim(),
        display_order: maxOrder + 1,
        is_active: catForm.is_active,
        fields: [],
        hide_rules: {},
        option_filters: {},
      });
      setSavingCat(false);
      if (error) {
        toast.error("فشل إضافة التصنيف: " + getFriendlyError(error));
        return;
      }
      toast.success("تم إضافة التصنيف");
      setSelectedKey(catForm.category_key.trim());
    }
    setCatDialogOpen(false);
    await refresh();
  };

  const deleteCategory = async (def: CategoryDefinition) => {
    const { error } = await supabase
      .from("category_definitions")
      .delete()
      .eq("id", def.id);
    if (error) {
      toast.error("فشل حذف التصنيف: " + getFriendlyError(error));
      return;
    }
    toast.success("تم حذف التصنيف");
    if (selectedKey === def.category_key) setSelectedKey(null);
    await refresh();
  };

  const moveCategory = async (def: CategoryDefinition, dir: -1 | 1) => {
    const sorted = [...definitions].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((d) => d.id === def.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await supabase
      .from("category_definitions")
      .update({ display_order: other.display_order })
      .eq("id", def.id);
    await supabase
      .from("category_definitions")
      .update({ display_order: def.display_order })
      .eq("id", other.id);
    await refresh();
  };

  // ============== Field CRUD ==============
  const openNewField = () => {
    setFieldEditingIndex(null);
    setFieldForm(emptyFieldForm);
    setFieldDialogOpen(true);
  };

  const openEditField = (index: number) => {
    if (!selected) return;
    const f = selected.fields[index];
    setFieldEditingIndex(index);
    setFieldForm({
      key: f.key,
      label: f.label,
      type: f.type,
      optionsText: (f.options || []).join("\n"),
    });
    setFieldDialogOpen(true);
  };

  const saveField = async () => {
    if (!selected) return;
    if (!fieldForm.key.trim() || !fieldForm.label.trim()) {
      toast.error("يرجى ملء المفتاح والاسم");
      return;
    }
    const newField: MetadataField = {
      key: fieldForm.key.trim(),
      label: fieldForm.label.trim(),
      type: fieldForm.type,
    };
    if (fieldForm.type === "select") {
      const opts = fieldForm.optionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (opts.length === 0) {
        toast.error("يرجى إضافة خيارات للقائمة");
        return;
      }
      newField.options = opts;
    }
    const newFields = [...selected.fields];
    if (fieldEditingIndex !== null) {
      newFields[fieldEditingIndex] = newField;
    } else {
      if (newFields.some((f) => f.key === newField.key)) {
        toast.error("مفتاح مكرر");
        return;
      }
      newFields.push(newField);
    }
    const { error } = await supabase
      .from("category_definitions")
      .update({ fields: newFields as any })
      .eq("id", selected.id);
    if (error) {
      toast.error("فشل الحفظ: " + getFriendlyError(error));
      return;
    }
    toast.success("تم الحفظ");
    setFieldDialogOpen(false);
    await refresh();
  };

  const deleteField = async (index: number) => {
    if (!selected) return;
    const newFields = selected.fields.filter((_, i) => i !== index);
    const { error } = await supabase
      .from("category_definitions")
      .update({ fields: newFields as any })
      .eq("id", selected.id);
    if (error) {
      toast.error("فشل الحذف: " + getFriendlyError(error));
      return;
    }
    toast.success("تم حذف الخانة");
    await refresh();
  };

  const moveField = async (index: number, dir: -1 | 1) => {
    if (!selected) return;
    const newFields = [...selected.fields];
    const swap = index + dir;
    if (swap < 0 || swap >= newFields.length) return;
    [newFields[index], newFields[swap]] = [newFields[swap], newFields[index]];
    await supabase
      .from("category_definitions")
      .update({ fields: newFields as any })
      .eq("id", selected.id);
    await refresh();
  };

  // ============== Hide rules ==============
  const openNewHideRule = () => {
    setHideRuleForm({ triggerKey: "", triggerValue: "", hiddenFieldsText: "" });
    setHideRuleDialogOpen(true);
  };

  const saveHideRule = async () => {
    if (!selected) return;
    const { triggerKey, triggerValue, hiddenFieldsText } = hideRuleForm;
    if (!triggerKey || !triggerValue || !hiddenFieldsText.trim()) {
      toast.error("يرجى ملء كل الحقول");
      return;
    }
    const hiddenFields = hiddenFieldsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newRules = { ...selected.hide_rules };
    newRules[triggerKey] = { ...(newRules[triggerKey] || {}) };
    newRules[triggerKey][triggerValue] = hiddenFields;
    const { error } = await supabase
      .from("category_definitions")
      .update({ hide_rules: newRules as any })
      .eq("id", selected.id);
    if (error) {
      toast.error("فشل الحفظ: " + getFriendlyError(error));
      return;
    }
    toast.success("تم حفظ القاعدة");
    setHideRuleDialogOpen(false);
    await refresh();
  };

  const deleteHideRule = async (triggerKey: string, triggerValue: string) => {
    if (!selected) return;
    const newRules = { ...selected.hide_rules };
    if (newRules[triggerKey]) {
      const v = { ...newRules[triggerKey] };
      delete v[triggerValue];
      if (Object.keys(v).length === 0) delete newRules[triggerKey];
      else newRules[triggerKey] = v;
    }
    const { error } = await supabase
      .from("category_definitions")
      .update({ hide_rules: newRules as any })
      .eq("id", selected.id);
    if (error) {
      toast.error("فشل الحذف: " + getFriendlyError(error));
      return;
    }
    toast.success("تم الحذف");
    await refresh();
  };

  // ============== Option filters ==============
  const openNewOptionFilter = () => {
    setOptionFilterForm({ targetKey: "", triggerKey: "", triggerValue: "", allowedOptionsText: "" });
    setOptionFilterDialogOpen(true);
  };

  const saveOptionFilter = async () => {
    if (!selected) return;
    const { targetKey, triggerKey, triggerValue, allowedOptionsText } = optionFilterForm;
    if (!targetKey || !triggerKey || !triggerValue || !allowedOptionsText.trim()) {
      toast.error("يرجى ملء كل الحقول");
      return;
    }
    const allowed = allowedOptionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newFilters = { ...selected.option_filters };
    newFilters[targetKey] = { ...(newFilters[targetKey] || {}) };
    newFilters[targetKey][triggerKey] = { ...(newFilters[targetKey][triggerKey] || {}) };
    newFilters[targetKey][triggerKey][triggerValue] = allowed;
    const { error } = await supabase
      .from("category_definitions")
      .update({ option_filters: newFilters as any })
      .eq("id", selected.id);
    if (error) {
      toast.error("فشل الحفظ: " + getFriendlyError(error));
      return;
    }
    toast.success("تم حفظ التصفية");
    setOptionFilterDialogOpen(false);
    await refresh();
  };

  const deleteOptionFilter = async (targetKey: string, triggerKey: string, triggerValue: string) => {
    if (!selected) return;
    const newFilters = { ...selected.option_filters };
    if (newFilters[targetKey]?.[triggerKey]) {
      const v = { ...newFilters[targetKey][triggerKey] };
      delete v[triggerValue];
      if (Object.keys(v).length === 0) {
        const t = { ...newFilters[targetKey] };
        delete t[triggerKey];
        if (Object.keys(t).length === 0) delete newFilters[targetKey];
        else newFilters[targetKey] = t;
      } else {
        newFilters[targetKey] = { ...newFilters[targetKey], [triggerKey]: v };
      }
    }
    const { error } = await supabase
      .from("category_definitions")
      .update({ option_filters: newFilters as any })
      .eq("id", selected.id);
    if (error) {
      toast.error("فشل الحذف: " + getFriendlyError(error));
      return;
    }
    toast.success("تم الحذف");
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          إدارة التصنيفات والخانات
        </h2>
        <Button onClick={openNewCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          تصنيف جديد
        </Button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar with categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">التصنيفات ({definitions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-2 max-h-[600px] overflow-y-auto">
            {definitions
              .slice()
              .sort((a, b) => a.display_order - b.display_order)
              .map((def) => (
                <div
                  key={def.id}
                  className={`flex items-center gap-1 p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedKey === def.category_key ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedKey(def.category_key)}
                >
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCategory(def, -1);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCategory(def, 1);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {def.label}
                    {!def.is_active && <span className="text-xs text-muted-foreground mr-1">(مخفي)</span>}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditCategory(def);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete({ type: "category", payload: def });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Editor */}
        {selected ? (
          <div className="space-y-6">
            {/* Fields */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  خانات تصنيف: {selected.label}
                </CardTitle>
                <Button onClick={openNewField} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> إضافة خانة
                </Button>
              </CardHeader>
              <CardContent>
                {selected.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    لا توجد خانات. اضغط "إضافة خانة" للبدء.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selected.fields.map((field, idx) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-2 p-3 rounded-md border bg-card"
                      >
                        <div className="flex flex-col">
                          <button
                            onClick={() => moveField(idx, -1)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveField(idx, 1)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{field.label}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {field.key} • {field.type === "select" ? `قائمة (${field.options?.length || 0} خيار)` : "نص"}
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => openEditField(idx)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => setConfirmDelete({ type: "field", payload: idx })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hide rules */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  قواعد إخفاء الخانات
                </CardTitle>
                <Button onClick={openNewHideRule} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> قاعدة جديدة
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  مثال: عند اختيار "أرض" في "نوع العقار" أخفِ الخانات: rooms، bathrooms، floor.
                </p>
                {Object.keys(selected.hide_rules).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد قواعد إخفاء.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selected.hide_rules).flatMap(([trigKey, valueMap]) =>
                      Object.entries(valueMap).map(([trigVal, hidden]) => (
                        <div
                          key={`${trigKey}-${trigVal}`}
                          className="flex items-start gap-2 p-3 rounded-md border bg-card text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div>
                              <span className="font-medium">عند:</span> {trigKey} = "{trigVal}"
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">إخفاء:</span> {hidden.join("، ")}
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() =>
                              setConfirmDelete({
                                type: "hideRule",
                                payload: { triggerKey: trigKey, triggerValue: trigVal },
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Option filters */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListFilter className="h-5 w-5" />
                  تصفية خيارات القوائم
                </CardTitle>
                <Button onClick={openNewOptionFilter} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> تصفية جديدة
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  مثال: في حقل "المادة"، عند اختيار "سرير" في "نوع الأثاث" اعرض فقط: خشب، معدن، قماش.
                </p>
                {Object.keys(selected.option_filters).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد تصفيات.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selected.option_filters).flatMap(([targetKey, trigMap]) =>
                      Object.entries(trigMap).flatMap(([trigKey, valMap]) =>
                        Object.entries(valMap).map(([trigVal, allowed]) => (
                          <div
                            key={`${targetKey}-${trigKey}-${trigVal}`}
                            className="flex items-start gap-2 p-3 rounded-md border bg-card text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <div>
                                <span className="font-medium">حقل:</span> {targetKey}
                              </div>
                              <div className="text-xs">
                                عند {trigKey} = "{trigVal}"
                              </div>
                              <div className="text-xs text-muted-foreground">
                                المسموح: {allowed.join("، ")}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() =>
                                setConfirmDelete({
                                  type: "optionFilter",
                                  payload: { targetKey, triggerKey: trigKey, triggerValue: trigVal },
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              اختر تصنيفاً للبدء
            </CardContent>
          </Card>
        )}
      </div>

      {/* ===== Category dialog ===== */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{catEditing ? "تعديل تصنيف" : "تصنيف جديد"}</DialogTitle>
            <DialogDescription>
              المفتاح هو القيمة المخزنة في قاعدة البيانات (لا تعدله للتصنيفات الموجودة).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>المفتاح (key)</Label>
              <Input
                value={catForm.category_key}
                onChange={(e) => setCatForm({ ...catForm, category_key: e.target.value })}
                placeholder="مثلاً: سيارات"
              />
            </div>
            <div>
              <Label>الاسم المعروض</Label>
              <Input
                value={catForm.label}
                onChange={(e) => setCatForm({ ...catForm, label: e.target.value })}
                placeholder="مثلاً: سيارات"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={catForm.is_active}
                onCheckedChange={(v) => setCatForm({ ...catForm, is_active: v })}
              />
              <Label>نشط (يظهر في النموذج)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>إلغاء</Button>
            <Button onClick={saveCategory} disabled={savingCat}>
              {savingCat && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Field dialog ===== */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{fieldEditingIndex !== null ? "تعديل خانة" : "خانة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>المفتاح (key)</Label>
              <Input
                value={fieldForm.key}
                onChange={(e) => setFieldForm({ ...fieldForm, key: e.target.value })}
                placeholder="مثلاً: brand"
                disabled={fieldEditingIndex !== null}
              />
            </div>
            <div>
              <Label>الاسم المعروض</Label>
              <Input
                value={fieldForm.label}
                onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                placeholder="مثلاً: الماركة"
              />
            </div>
            <div>
              <Label>النوع</Label>
              <Select
                value={fieldForm.type}
                onValueChange={(v: "text" | "select") => setFieldForm({ ...fieldForm, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">نص حر</SelectItem>
                  <SelectItem value="select">قائمة منسدلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {fieldForm.type === "select" && (
              <div>
                <Label>الخيارات (سطر لكل خيار)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-background p-2 text-sm"
                  value={fieldForm.optionsText}
                  onChange={(e) => setFieldForm({ ...fieldForm, optionsText: e.target.value })}
                  placeholder={"مثلاً:\nبنزين\nديزل\nكهربائي"}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFieldDialogOpen(false)}>إلغاء</Button>
            <Button onClick={saveField}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Hide rule dialog ===== */}
      <Dialog open={hideRuleDialogOpen} onOpenChange={setHideRuleDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>قاعدة إخفاء جديدة</DialogTitle>
            <DialogDescription>
              تخفي حقولاً محددة بناءً على قيمة حقل آخر.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>الحقل المحرّك (trigger)</Label>
              <Select
                value={hideRuleForm.triggerKey}
                onValueChange={(v) => setHideRuleForm({ ...hideRuleForm, triggerKey: v, triggerValue: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحقل" />
                </SelectTrigger>
                <SelectContent>
                  {selected?.fields
                    .filter((f) => f.type === "select")
                    .map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label} ({f.key})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>القيمة المحرّكة</Label>
              <Select
                value={hideRuleForm.triggerValue}
                onValueChange={(v) => setHideRuleForm({ ...hideRuleForm, triggerValue: v })}
                disabled={!hideRuleForm.triggerKey}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القيمة" />
                </SelectTrigger>
                <SelectContent>
                  {(selected?.fields.find((f) => f.key === hideRuleForm.triggerKey)?.options || []).map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الحقول التي ستُخفى (مفاتيح مفصولة بفاصلة)</Label>
              <Input
                value={hideRuleForm.hiddenFieldsText}
                onChange={(e) => setHideRuleForm({ ...hideRuleForm, hiddenFieldsText: e.target.value })}
                placeholder="مثلاً: rooms, bathrooms, floor"
              />
              <p className="text-xs text-muted-foreground mt-1">
                المفاتيح المتاحة: {selected?.fields.map((f) => f.key).join(", ")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHideRuleDialogOpen(false)}>إلغاء</Button>
            <Button onClick={saveHideRule}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Option filter dialog ===== */}
      <Dialog open={optionFilterDialogOpen} onOpenChange={setOptionFilterDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تصفية خيارات جديدة</DialogTitle>
            <DialogDescription>
              تُقيّد خيارات قائمة معينة بناءً على قيمة حقل آخر.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>الحقل المستهدف (الذي ستُصفّى خياراته)</Label>
              <Select
                value={optionFilterForm.targetKey}
                onValueChange={(v) => setOptionFilterForm({ ...optionFilterForm, targetKey: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحقل" />
                </SelectTrigger>
                <SelectContent>
                  {selected?.fields
                    .filter((f) => f.type === "select")
                    .map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label} ({f.key})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الحقل المحرّك</Label>
              <Select
                value={optionFilterForm.triggerKey}
                onValueChange={(v) => setOptionFilterForm({ ...optionFilterForm, triggerKey: v, triggerValue: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحقل" />
                </SelectTrigger>
                <SelectContent>
                  {selected?.fields
                    .filter((f) => f.type === "select" && f.key !== optionFilterForm.targetKey)
                    .map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label} ({f.key})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>القيمة المحرّكة</Label>
              <Select
                value={optionFilterForm.triggerValue}
                onValueChange={(v) => setOptionFilterForm({ ...optionFilterForm, triggerValue: v })}
                disabled={!optionFilterForm.triggerKey}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القيمة" />
                </SelectTrigger>
                <SelectContent>
                  {(selected?.fields.find((f) => f.key === optionFilterForm.triggerKey)?.options || []).map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الخيارات المسموح بها (مفصولة بفاصلة)</Label>
              <Input
                value={optionFilterForm.allowedOptionsText}
                onChange={(e) => setOptionFilterForm({ ...optionFilterForm, allowedOptionsText: e.target.value })}
                placeholder="مثلاً: خشب, معدن, قماش"
              />
              <p className="text-xs text-muted-foreground mt-1">
                الخيارات المتاحة: {(selected?.fields.find((f) => f.key === optionFilterForm.targetKey)?.options || []).join(", ")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOptionFilterDialogOpen(false)}>إلغاء</Button>
            <Button onClick={saveOptionFilter}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete confirmation ===== */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDelete) return;
                if (confirmDelete.type === "category") {
                  await deleteCategory(confirmDelete.payload);
                } else if (confirmDelete.type === "field") {
                  await deleteField(confirmDelete.payload);
                } else if (confirmDelete.type === "hideRule") {
                  await deleteHideRule(confirmDelete.payload.triggerKey, confirmDelete.payload.triggerValue);
                } else if (confirmDelete.type === "optionFilter") {
                  await deleteOptionFilter(
                    confirmDelete.payload.targetKey,
                    confirmDelete.payload.triggerKey,
                    confirmDelete.payload.triggerValue
                  );
                }
                setConfirmDelete(null);
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategoriesTab;
