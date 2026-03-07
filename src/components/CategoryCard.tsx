import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  color: string;
  categoryValue?: string;
  adLabel?: string;
}

const CategoryCard = ({ icon: Icon, title, count, color, categoryValue, adLabel = "إعلان" }: CategoryCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const value = categoryValue || title;
    navigate(`/listings?category=${encodeURIComponent(value)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${color}`}
      >
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      
    </div>
  );
};

export default CategoryCard;
