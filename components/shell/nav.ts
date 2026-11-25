import {
  LayoutDashboard,
  Route,
  GraduationCap,
  Compass,
  Network,
  Dumbbell,
  Brain,
  Microscope,
  BookOpen,
  PenLine,
  MessageCircle,
  Layers,
  Library,
  Share2,
  FolderKanban,
  Swords,
  BarChart3,
  Trophy,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Learn",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/path", label: "Today's Plan", icon: Route },
      { href: "/academy", label: "Foundations", icon: GraduationCap },
      { href: "/topics", label: "Master a Topic", icon: Compass },
      { href: "/subjects", label: "Skill Tree", icon: Network },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/practice", label: "Practice Center", icon: Dumbbell },
      { href: "/arena", label: "Problem Arena", icon: Brain },
      { href: "/review", label: "Review", icon: Layers },
      { href: "/exams", label: "Boss Battles", icon: Swords },
    ],
  },
  {
    label: "Labs",
    items: [
      { href: "/research", label: "Research Lab", icon: Microscope },
      { href: "/read", label: "Reading Lab", icon: BookOpen },
      { href: "/write", label: "Writing Lab", icon: PenLine },
      { href: "/tutor", label: "AI Tutor", icon: MessageCircle },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/library", label: "Library", icon: Library },
      { href: "/graph", label: "Knowledge Graph", icon: Share2 },
      { href: "/portfolio", label: "Portfolio", icon: FolderKanban },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/achievements", label: "Achievements", icon: Trophy },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
