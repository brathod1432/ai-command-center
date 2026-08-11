import {
  Activity,
  Banknote,
  BookOpen,
  Bot,
  Code2,
  FileBarChart,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Package,
  Plug,
  ScrollText,
  Settings,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { href: "/dashboard", label: "Command Center", icon: LayoutDashboard, permission: "dashboard:read" },
      { href: "/my-work", label: "My Work", icon: Inbox, permission: "dashboard:read" },
      { href: "/agents", label: "Agents", icon: Bot, permission: "agent:read" },
    ],
  },
  {
    heading: "Functions",
    items: [
      { href: "/sales", label: "Sales", icon: TrendingUp, permission: "dashboard:read" },
      { href: "/engineering", label: "Engineering", icon: Code2, permission: "dashboard:read" },
      { href: "/finance", label: "Finance", icon: Banknote, permission: "dashboard:read" },
      { href: "/support", label: "Support", icon: LifeBuoy, permission: "dashboard:read" },
      { href: "/customers", label: "Customer Success", icon: HeartHandshake, permission: "dashboard:read" },
      { href: "/marketing", label: "Marketing", icon: Megaphone, permission: "dashboard:read" },
      { href: "/operations", label: "Operations", icon: Settings2, permission: "dashboard:read" },
      { href: "/product", label: "Product", icon: Package, permission: "dashboard:read" },
    ],
  },
  {
    heading: "Work",
    items: [
      { href: "/workflows", label: "Workflows", icon: Workflow, permission: "workflow:read" },
      { href: "/reports", label: "Reports", icon: FileBarChart, permission: "dashboard:read" },
      { href: "/knowledge", label: "Knowledge", icon: BookOpen, permission: "knowledge:read" },
      { href: "/integrations", label: "Integrations", icon: Plug, permission: "integration:read" },
    ],
  },
  {
    heading: "Governance",
    items: [
      { href: "/audit", label: "Audit Trail", icon: ScrollText, permission: "audit:read" },
      { href: "/status", label: "Status", icon: Activity, permission: "dashboard:read" },
      { href: "/team", label: "Team", icon: Users, permission: "user:read" },
      { href: "/settings", label: "Settings", icon: Settings, permission: "dashboard:read" },
      { href: "/showcase", label: "Showcase", icon: Sparkles },
    ],
  },
];

/** Flat list of navigable items (used by the command palette). */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
