import {
  Activity,
  Bell,
  Bike,
  Briefcase,
  Car,
  CircleDollarSign,
  Coffee,
  CreditCard,
  FileText,
  Film,
  House,
  PieChart,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Bell,
  Bike,
  Briefcase,
  Car,
  CircleDollarSign,
  Coffee,
  CreditCard,
  FileText,
  Film,
  House,
  PieChart,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Zap,
};

export function getIcon(name?: string | null): LucideIcon {
  if (!name) return CircleDollarSign;
  return iconMap[name] ?? CircleDollarSign;
}

export const AVAILABLE_ICONS = Object.keys(iconMap);
