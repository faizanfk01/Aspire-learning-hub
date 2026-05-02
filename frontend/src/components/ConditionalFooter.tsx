"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_ON = ["/ai-tutor", "/admin"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((r) => pathname.startsWith(r))) return null;
  return <Footer />;
}
