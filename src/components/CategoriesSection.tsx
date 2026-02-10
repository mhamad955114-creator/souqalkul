import { useState, useEffect } from "react";
import { Car, Home, Smartphone, Shirt, Sofa, Briefcase, Gamepad2, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CategoryCard from "./CategoryCard";

const categoryDefs = [
  { icon: Car, title: "سيارات", color: "bg-primary", categoryValue: "سيارات" },
  { icon: Home, title: "عقارات", color: "bg-accent", categoryValue: "عقارات" },
  { icon: Smartphone, title: "إلكترونيات", color: "bg-blue-500", categoryValue: "الكترونيات" },
  { icon: Shirt, title: "ملابس", color: "bg-pink-500", categoryValue: "ملابس" },
  { icon: Sofa, title: "أثاث", color: "bg-amber-500", categoryValue: "أثاث" },
  { icon: Briefcase, title: "وظائف", color: "bg-indigo-500", categoryValue: "وظائف" },
  { icon: Gamepad2, title: "ألعاب", color: "bg-red-500", categoryValue: "ألعاب" },
  { icon: Wrench, title: "خدمات", color: "bg-emerald-500", categoryValue: "خدمات" },
];

const CategoriesSection = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("category")
        .eq("status", "active");

      if (!error && data) {
        const map: Record<string, number> = {};
        data.forEach((row) => {
          map[row.category] = (map[row.category] || 0) + 1;
        });
        setCounts(map);
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            تصفح حسب التصنيف
          </h2>
          <p className="text-muted-foreground">
            اختر التصنيف المناسب لتجد ما تبحث عنه
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categoryDefs.map((category, index) => (
            <div
              key={category.categoryValue}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CategoryCard
                {...category}
                count={counts[category.categoryValue] || 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
