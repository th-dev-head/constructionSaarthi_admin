import {
  LayoutDashboard,
  Users,
  CreditCard,
  FolderOpen,
  BarChart3,
  Users2,
  LifeBuoy,
  Settings,
  HelpCircle,
  Apple,
  MessageCircle,
} from "lucide-react";
import { RiDiscountPercentLine } from "react-icons/ri";

export const MenuItems = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: <LayoutDashboard size={22} />,
  },
  {
    name: "Users",
    link: "/users",
    icon: <Users size={22} />,
  },
  {
    name: "Subscriptions",
    link: "/subscriptions",
    icon: <CreditCard size={22} />,
  },
  // {
  //   name: "Projects",
  //   link: "/projects",
  //   icon: <FolderOpen size={22} />,
  // },
  // {
  //   name: "Reports",
  //   link: "/reports",
  //   icon: <BarChart3 size={22} />,
  // },
  // {
  //   name: "Teams & Roles",
  //   link: "/teams",
  //   icon: <Users2 size={22} />,
  // },
  {
    name: "Coupon Management",
    link: "/coupon-management",
    icon: <RiDiscountPercentLine  size={22} />,
  },
  {
    name: "Prompts Management",
    link: "/prompts",
    icon: <MessageCircle size={22} />,
  },
  // {
  //   name: "Support Logs",
  //   link: "/support",
  //   icon: <LifeBuoy size={22} />,
  // },

  // 🔽 DROPDOWN — FIXED
  {
    name: "Roles & Permissions",
    icon: <Users2 size={22} />,
    submenu: [
      {
        name: "Roles",
        link: "/roles/role-management",
        icon: <Settings size={18} />,
      },
      {
        name: "Features",
        link: "/roles/feature-management",
        icon: <Settings size={18} />,
      },
      {
        name: "Permissions",
        link: "/roles/permission-management",
        icon: <HelpCircle size={18} />,
      },
    ],
  },

  // Section header
  {
    name: "Types",
    icon: <Apple size={22} />,
    submenu: [
      {
        name: "Gavge Type",
        link: "/gavge",
        icon: <LifeBuoy size={22} />,
      },
      {
        name: "Media Type",
        link: "/media",
        icon: <BarChart3 size={22} />,
      },
      {
        name: "Shift Type",
        link: "/shift",
        icon: <LifeBuoy size={22} />,
      },
      {
        name: "Inventory Type",
        link: "/inventory",
        icon: <LifeBuoy size={22} />,
      },
      {
        name: "Coupon Type",
        link: "/coupon",
        icon: <LifeBuoy size={22} />,
      },
      {
        name: "Bank",
        link: "/bank",
        icon: <LifeBuoy size={22} />,
      },
    ],
  },

  // {
  //   name: "General",
  //   icon: <Settings size={22} />,
  //   submenu: [
  //     {
  //       name: "Settings",
  //       link: "/dashboard/settings",
  //       icon: <Settings size={18} />,
  //     },
  //     {
  //       name: "Help",
  //       link: "/dashboard/help",
  //       icon: <HelpCircle size={18} />,
  //     }
  //   ],
  // },
];
