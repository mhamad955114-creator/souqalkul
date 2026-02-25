import { useState, useEffect } from "react";
import { Car, Home, Smartphone, Shirt, Watch, Sofa, Briefcase, Gamepad2, Wrench, PawPrint, Factory, Tractor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import CategoryCard from "./CategoryCard";

const CategoriesSection = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const { t } = useLanguage();

  const categoryDefs = [
    { icon: Car, title: t.categories.cars, color: "bg-primary", categoryValue: "سيارات" },
    { icon: Home, title: t.categories.realEstate, color: "bg-accent", categoryValue: "عقارات" },
    { icon: Smartphone, title: t.categories.electronics, color: "bg-blue-500", categoryValue: "الكترونيات" },
    { icon: Shirt, title: t.categories.clothing, color: "bg-pink-500", categoryValue: "ملابس" },
    { icon: Watch, title: t.categories.accessories, color: "bg-violet-500", categoryValue: "اكسسوارات" },
    { icon: Sofa, title: t.categories.furniture, color: "bg-amber-500", categoryValue: "أثاث" },
    { icon: Briefcase, title: t.categories.jobs, color: "bg-indigo-500", categoryValue: "وظائف" },
    { icon: Gamepad2, title: t.categories.games, color: "bg-red-500", categoryValue: "ألعاب" },
    { icon: Wrench, title: t.categories.services, color: "bg-emerald-500", categoryValue: "خدمات" },
    
    { icon: PawPrint, title: t.categories.pets, color: "bg-orange-500", categoryValue: "حيوانات أليفة" },
    { icon: Factory, title: t.categories.industrial, color: "bg-slate-500", categoryValue: "معدات صناعية" },
    { icon: Tractor, title: t.categories.agricultural, color: "bg-green-600", categoryValue: "معدات زراعية" },
  ];

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
            {t.categories.browseByCategory}
          </h2>
          <p className="text-muted-foreground">
            {t.categories.chooseCategoryDesc}
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
                adLabel={t.categories.ad}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
