import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import ListingCard from "./ListingCard";

const listings = [
  {
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=375&fit=crop",
    title: "مرسيدس E300 موديل 2022 - حالة ممتازة",
    price: "٢٥٠,٠٠٠ ر.س",
    location: "الرياض",
    time: "منذ ساعة",
    featured: true,
  },
  {
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=375&fit=crop",
    title: "شقة فاخرة للإيجار - 3 غرف نوم",
    price: "٨,٠٠٠ ر.س/شهر",
    location: "جدة",
    time: "منذ 3 ساعات",
    featured: true,
  },
  {
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=375&fit=crop",
    title: "آيفون 15 برو ماكس - جديد بالكرتونة",
    price: "٤,٥٠٠ ر.س",
    location: "الدمام",
    time: "منذ 5 ساعات",
    featured: false,
  },
  {
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=375&fit=crop",
    title: "طقم كنب حديث - 7 مقاعد",
    price: "٣,٢٠٠ ر.س",
    location: "مكة المكرمة",
    time: "منذ 6 ساعات",
    featured: false,
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=375&fit=crop",
    title: "ساعة أبل واتش سيريز 9",
    price: "١,٨٠٠ ر.س",
    location: "المدينة المنورة",
    time: "منذ 8 ساعات",
    featured: false,
  },
  {
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=375&fit=crop",
    title: "أرض تجارية للبيع - موقع مميز",
    price: "١,٥٠٠,٠٠٠ ر.س",
    location: "الخبر",
    time: "منذ يوم",
    featured: true,
  },
  {
    image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=375&fit=crop",
    title: "أحذية رياضية نايكي - مقاس 43",
    price: "٤٥٠ ر.س",
    location: "الرياض",
    time: "منذ يوم",
    featured: false,
  },
  {
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=375&fit=crop",
    title: "طاولة طعام خشب طبيعي - 6 كراسي",
    price: "٢,١٠٠ ر.س",
    location: "جدة",
    time: "منذ يومين",
    featured: false,
  },
];

const ListingsSection = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              أحدث الإعلانات
            </h2>
            <p className="text-muted-foreground">
              تصفح آخر الإعلانات المضافة في السوق
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            عرض الكل
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing, index) => (
            <div
              key={index}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ListingCard {...listing} />
            </div>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Button variant="outline">
            عرض الكل
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ListingsSection;
