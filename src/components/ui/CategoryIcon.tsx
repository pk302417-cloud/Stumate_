import { Armchair, BookOpen, Laptop, Refrigerator, BedDouble, CookingPot, Lamp, PenTool, Ruler, Dumbbell, Bike, Package, type LucideIcon } from 'lucide-react';
import { categoryIconName } from '@/lib/format';

const ICONS: Record<string, LucideIcon> = {
  Armchair, BookOpen, Laptop, Refrigerator, BedDouble, CookingPot, Lamp, PenTool, Ruler, Dumbbell, Bike, Package,
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[categoryIconName(slug)] ?? Package;
  return <Icon className={className} />;
}
