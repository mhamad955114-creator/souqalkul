import { Heart, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface ListingCardProps {
  image: string;
  title: string;
  price: string;
  location: string;
  time: string;
  featured?: boolean;
}

const ListingCard = ({ image, title, price, location, time, featured }: ListingCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {featured && (
          <div className="absolute top-3 right-3 gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            مميز
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 left-3 w-9 h-9 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="text-xl font-bold text-primary mb-3">{price}</div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
