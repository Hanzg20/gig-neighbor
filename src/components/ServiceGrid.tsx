import ServiceCard from "./ServiceCard";

const mockServices = [
  {
    id: 1,
    title: "Deep Cleaning - Whole House Sanitization",
    provider: "Auntie Li",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 128,
    distance: "1.2km",
    nextAvailable: "Today 2pm",
    verified: true,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    tiers: [
      { name: "Basic", price: 80, description: "2h Standard Clean" },
      { name: "Deep", price: 150, description: "4h Deep Clean" },
      { name: "Ultimate", price: 280, description: "6h + Sanitization" },
    ],
  },
  {
    id: 2,
    title: "Pro Moving - Packing & Efficient Delivery",
    provider: "Master Wang",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviews: 89,
    distance: "2.5km",
    nextAvailable: "Tomorrow 9am",
    verified: true,
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=300&fit=crop",
    tiers: [
      { name: "Truck Only", price: 120, description: "Vehice Rental Only" },
      { name: "Standard", price: 220, description: "Truck + 1 Helper" },
      { name: "Full", price: 380, description: "Truck + 2 Helpers" },
    ],
  },
  {
    id: 3,
    title: "Errands & Help - Just a Call Away",
    provider: "Zhang",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
    rating: 5.0,
    reviews: 56,
    distance: "0.8km",
    nextAvailable: "Now",
    urgent: true,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop",
    tiers: [
      { name: "Quick", price: 15, description: "Within 3km" },
      { name: "Standard", price: 25, description: "Within 5km" },
      { name: "Priority", price: 40, description: "Extra Fast" },
    ],
  },
  {
    id: 4,
    title: "Plumbing - Leak Fix & Fast Repair",
    provider: "Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4.7,
    reviews: 203,
    distance: "3.1km",
    nextAvailable: "Today 4pm",
    verified: true,
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    tiers: [
      { name: "Check", price: 60, description: "Detection Only" },
      { name: "Repair", price: 120, description: "Fix + Basic Parts" },
      { name: "Major", price: 250, description: "Complex Repair" },
    ],
  },
  {
    id: 5,
    title: "Beauty & Nails - Refine Your Style",
    provider: "Coco",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 167,
    distance: "1.8km",
    nextAvailable: "Tomorrow 11am",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
    tiers: [
      { name: "Solid", price: 35, description: "Solid Color" },
      { name: "Fancy", price: 65, description: "Design Art" },
      { name: "Full Set", price: 99, description: "Nails + Lashes" },
    ],
  },
  {
    id: 6,
    title: "Pet Care - Loving Hand for Furry Friends",
    provider: "Emma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5.0,
    reviews: 42,
    distance: "0.5km",
    nextAvailable: "Available Now",
    verified: true,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    tiers: [
      { name: "Walk", price: 25, description: "30min Walk" },
      { name: "Visit", price: 50, description: "Feed & Play" },
      { name: "Full Day", price: 100, description: "24h Care" },
    ],
  },
];

const ServiceGrid = () => {
  return (
    <section className="py-8 container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Popular Nearby</h2>
          <p className="text-muted-foreground text-sm mt-1">Found based on your node</p>
        </div>
        <button className="text-sm font-bold text-primary hover:underline">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockServices.map((service, index) => (
          <div
            key={service.id}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ServiceCard {...service} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceGrid;
