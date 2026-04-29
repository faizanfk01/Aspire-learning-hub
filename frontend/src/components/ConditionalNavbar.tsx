"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDDEN_ON = ["/admin"];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((r) => pathname.startsWith(r))) return null;
  return <Navbar />;
}
