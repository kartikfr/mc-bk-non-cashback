import { useState } from "react";
import { Button } from "./ui/button";
import { ShoppingBag, Utensils, Fuel, Plane, Coffee, ShoppingCart, CreditCard } from "lucide-react";

const categories = [
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'text-pink-500' },
  { id: 'dining', name: 'Dining', icon: Utensils, color: 'text-orange-500' },
  { id: 'fuel', name: 'Fuel', icon: Fuel, color: 'text-blue-500' },
  { id: 'travel', name: 'Travel', icon: Plane, color: 'text-purple-500' },
  { id: 'food_delivery', name: 'Food Delivery', icon: Coffee, color: 'text-red-500' },
  { id: 'grocery', name: 'Grocery', icon: ShoppingCart, color: 'text-green-500' },
  { id: 'bills', name: 'Bills', icon: CreditCard, color: 'text-indigo-500' },
];

const CategoryCardGenius = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Find Cards by Category</h2>
          <p className="text-xl text-muted-foreground">
            Tell us where you spend, we'll find the perfect card
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all text-center group ${
                selectedCategory === category.id ? 'ring-2 ring-primary shadow-glow' : ''
              }`}
            >
              <category.icon className={`w-8 h-8 mx-auto mb-3 ${category.color} group-hover:scale-110 transition-transform`} />
              <p className="text-sm font-semibold">{category.name}</p>
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            Or answer a few quick questions about all your spending habits
          </p>
          <Button size="lg" className="shadow-xl hover:shadow-glow">
            Start Card Genius Quiz
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoryCardGenius;
