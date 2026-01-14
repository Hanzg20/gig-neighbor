import {
  Sparkle,
  Wrench,
  Truck,
  Scissors,
  Zap,
  Baby,
  Dog,
  ChefHat,
  Home,
  Utensils,
  PlaneTakeoff,
  Car,
  Snowflake,
  ShoppingBag,
  Construction,
  Hammer,
  Trash2,
  Footprints,
  Clock,
  Palette,
  BookOpen,
  Droplet,
  Wind,
  Heart,
  Soup,
  Leaf,
  Bug,
  MoreHorizontal
} from "lucide-react";

interface Category {
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const mainCategories: Category[] = [
  { icon: <ChefHat className="w-6 h-6" />, label: "Food", color: "#f59e0b" },
  { icon: <Truck className="w-6 h-6" />, label: "Moving", color: "#10b981" },
  { icon: <Baby className="w-6 h-6" />, label: "Kids", color: "#8b5cf6" },
  { icon: <Car className="w-6 h-6" />, label: "Carpool", color: "#3b82f6" },
  { icon: <Home className="w-6 h-6" />, label: "Real Estate", color: "#dc2626" },
  { icon: <Scissors className="w-6 h-6" />, label: "Beauty", color: "#ec4899" },
  { icon: <Sparkle className="w-6 h-6" />, label: "Cleaning", color: "#10b981" },
  { icon: <PlaneTakeoff className="w-6 h-6" />, label: "Airport", color: "#3b82f6" },
  { icon: <Hammer className="w-6 h-6" />, label: "Assembly", color: "#f59e0b" },
  { icon: <MoreHorizontal className="w-6 h-6" />, label: "More", color: "#6b7280" },
];

const CategoryGrid = () => {
  return (
    <section className="py-4 container">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-x-2 gap-y-4">
        {mainCategories.map((category, index) => (
          <button
            key={category.label}
            className="flex flex-col items-center gap-1.5 group transition-transform hover:scale-105 active:scale-95"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div
              className="category-icon shadow-warm group-hover:shadow-card-hover"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {category.icon}
            </div>
            <p className="text-[11px] font-bold text-foreground leading-tight text-center group-hover:text-primary transition-colors">
              {category.label}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
