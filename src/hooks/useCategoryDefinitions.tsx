import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MetadataField } from "@/lib/constants";

export interface CategoryDefinition {
  id: string;
  category_key: string;
  label: string;
  display_order: number;
  is_active: boolean;
  fields: MetadataField[];
  // hide_rules: { [triggerFieldKey]: { [triggerValue]: string[] of hidden field keys } }
  hide_rules: Record<string, Record<string, string[]>>;
  // option_filters: { [targetFieldKey]: { [triggerFieldKey]: { [triggerValue]: string[] of allowed options } } }
  option_filters: Record<string, Record<string, Record<string, string[]>>>;
}

let cache: CategoryDefinition[] | null = null;
const subscribers = new Set<(defs: CategoryDefinition[]) => void>();

const fetchAll = async (): Promise<CategoryDefinition[]> => {
  const { data, error } = await supabase
    .from("category_definitions")
    .select("*")
    .order("display_order", { ascending: true });
  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    category_key: row.category_key,
    label: row.label,
    display_order: row.display_order,
    is_active: row.is_active,
    fields: Array.isArray(row.fields) ? row.fields : [],
    hide_rules: row.hide_rules || {},
    option_filters: row.option_filters || {},
  }));
};

export const useCategoryDefinitions = () => {
  const [definitions, setDefinitions] = useState<CategoryDefinition[]>(cache || []);
  const [loading, setLoading] = useState(!cache);

  const refresh = useCallback(async () => {
    const data = await fetchAll();
    cache = data;
    subscribers.forEach((cb) => cb(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    const cb = (data: CategoryDefinition[]) => setDefinitions(data);
    subscribers.add(cb);
    if (!cache) {
      refresh();
    }
    return () => {
      subscribers.delete(cb);
    };
  }, [refresh]);

  const getByKey = useCallback(
    (key: string) => definitions.find((d) => d.category_key === key),
    [definitions]
  );

  const getFields = useCallback(
    (categoryKey: string): MetadataField[] => getByKey(categoryKey)?.fields || [],
    [getByKey]
  );

  const shouldHideField = useCallback(
    (fieldKey: string, categoryKey: string, metadata: Record<string, string>): boolean => {
      const def = getByKey(categoryKey);
      if (!def) return false;
      for (const [triggerKey, valueMap] of Object.entries(def.hide_rules)) {
        const triggerValue = metadata[triggerKey];
        if (!triggerValue) continue;
        const hiddenFields = valueMap[triggerValue];
        if (hiddenFields?.includes(fieldKey)) return true;
      }
      return false;
    },
    [getByKey]
  );

  const getFieldOptions = useCallback(
    (
      field: MetadataField,
      categoryKey: string,
      metadata: Record<string, string>
    ): string[] | undefined => {
      if (!field.options) return field.options;
      const def = getByKey(categoryKey);
      if (!def) return field.options;
      const filterRules = def.option_filters[field.key];
      if (!filterRules) return field.options;
      for (const [triggerKey, valueMap] of Object.entries(filterRules)) {
        const triggerValue = metadata[triggerKey];
        if (!triggerValue) continue;
        const allowed = valueMap[triggerValue];
        if (allowed) {
          return field.options.filter((opt) => allowed.includes(opt));
        }
      }
      return field.options;
    },
    [getByKey]
  );

  return {
    definitions,
    loading,
    refresh,
    getByKey,
    getFields,
    shouldHideField,
    getFieldOptions,
  };
};
