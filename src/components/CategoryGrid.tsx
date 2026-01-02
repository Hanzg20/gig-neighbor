import { 
  Sparkles, 
  Wrench, 
  Truck, 
  Scissors, 
  Zap,
  Baby,
  Dog,
  MoreHorizontal
} from "lucide-react";

interface Category {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  urgent?: boolean;
}

const categories: Category[] = [
  { icon: <Sparkles className="w-7 h-7" />, label: "家政", sublabel: "保洁清洗" },
  { icon: <Wrench className="w-7 h-7" />, label: "维修", sublabel: "水电管道" },
  { icon: <Truck className="w-7 h-7" />, label: "搬家", sublabel: "打包运输" },
  { icon: <Zap className="w-7 h-7" />, label: "跑腿", sublabel: "BeanHelper", urgent: true },
  { icon: <Scissors className="w-7 h-7" />, label: "美业", sublabel: "美甲美发" },
  { icon: <Baby className="w-7 h-7" />, label: "育儿", sublabel: "看护陪伴" },
  { icon: <Dog className="w-7 h-7" />, label: "宠物", sublabel: "遛狗照看" },
  { icon: <MoreHorizontal className="w-7 h-7" />, label: "更多", sublabel: "全部服务" },
];

const CategoryGrid = () => {
  return (
    <section className="py-6 container">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((category, index) => (
          <button
            key={category.label}
            className="flex flex-col items-center gap-2 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div 
              className={`category-icon ${
                category.urgent 
                  ? 'bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground' 
                  : 'hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {category.icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {category.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {category.sublabel}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
