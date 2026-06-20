"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, ShoppingBag, Info, Users } from "lucide-react";
import styles from "@/app/layout.module.css";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <nav className={styles.nav}>
      <Link href="/store" className={`${styles.navLink} ${isActive('/store') ? styles.activeLink : ''}`}>
        <ShoppingBag size={20} />
        <span>חנות</span>
      </Link>
      <Link href="/map" className={`${styles.navLink} ${isActive('/map') ? styles.activeLink : ''}`}>
        <Map size={20} />
        <span>מפה</span>
      </Link>
      <Link href="/community" className={`${styles.navLink} ${isActive('/community') ? styles.activeLink : ''}`}>
        <Users size={20} />
        <span>קהילה</span>
      </Link>
      <Link href="/about" className={`${styles.navLink} ${isActive('/about') ? styles.activeLink : ''}`}>
        <Info size={20} />
        <span>אודות</span>
      </Link>
    </nav>
  );
}
