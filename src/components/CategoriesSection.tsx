import { Car, Home, Smartphone, Shirt, Sofa, Briefcase, Gamepad2, Wrench } from "lucide-react";
import CategoryCard from "./CategoryCard";

const categories = [
  { icon: Car, title: "سيارات", count: 12500, color: "bg-primary" },
  { icon: Home, title: "عقارات", count: 8300, color: "bg-accent" },
  { icon: Smartphone, title: "إلكترونيات", count: 15200, color: "bg-blue-500" },
  { icon: Shirt, title: "ملابس", count: 6800, color: "bg-pink-500" },
  { icon: Sofa, title: "أثاث", count: 4200, color: "bg-amber-500" },
  { icon: Briefcase, title: "وظائف", count: 3100, color: "bg-indigo-500" },
  { icon: Gamepad2, title: "ألعاب", count: 2800, color: "bg-red-500" },
  { icon: Wrench, title: "خدمات", count: 5600, color: "bg-emerald-500" },
];

const CategoriesSection = () => {
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
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
