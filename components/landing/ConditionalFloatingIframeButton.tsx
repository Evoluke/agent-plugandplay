"use client";

import { usePathname } from "next/navigation";
import FloatingIframeButton from "./FloatingIframeButton";

const excludedRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/complete-profile",
  "/update-password",
  "/dashboard",
];

export default function ConditionalFloatingIframeButton() {
  const pathname = usePathname();
  if (excludedRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }
  return <FloatingIframeButton />;
}
