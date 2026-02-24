import { 
  Stamp, FileText, BookOpen, ArrowLeftRight, Home, X, User, PawPrint, Newspaper, 
  Music, TrendingUp, Cloud, MapPin, Settings, Calendar, Clock, DollarSign, Package, 
  Utensils, ShoppingBag, ShoppingCart, Sparkles, Heart, Plane, Star, Play, Volume2, Flame, Train, 
  Check, Tag, Bike, Wrench, GraduationCap, Users, Clapperboard, Shirt, Siren, Coins, 
  MessageCircle, HelpCircle, Globe, Tv, Mic, Thermometer, Landmark, Briefcase, 
  Building2, Dog, ChevronRight, ChevronDown, Plus, Coffee, PartyPopper, Store
} from 'lucide-react'

const LUCIDE_ICON_MAP = { 
  Stamp, FileText, BookOpen, ArrowLeftRight, Home, X, User, PawPrint, Newspaper, 
  Music, TrendingUp, Cloud, MapPin, Settings, Calendar, Clock, DollarSign, Package, 
  Utensils, ShoppingBag, ShoppingCart, Sparkles, Heart, Plane, Star, Play, Volume2, Flame, Train, 
  Check, Tag, Bike, Wrench, GraduationCap, Users, Clapperboard, Shirt, Siren, Coins, 
  MessageCircle, HelpCircle, Globe, Tv, Mic, Thermometer, Landmark, Briefcase, 
  Building2, Dog, ChevronRight, ChevronDown, Plus, Coffee, PartyPopper, Store
}

export default function LucideIcon({ name, size = 16, className = '', ...props }) {
  const Icon = LUCIDE_ICON_MAP[name]
  if (!Icon) return <span className={className}>{name}</span>
  return <Icon size={size} strokeWidth={1} className={className} {...props} />
}