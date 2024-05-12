"use client";

import { ReasonDemo } from "@/app/components";
import { ReasonDemoProvider } from "@/app/context/ReasoningDemoContext";
import styles from "./page.module.css";

export default function IndexPage() {
  return (
    <main className={styles.main}>
      <ReasonDemoProvider>
        <ReasonDemo />
      </ReasonDemoProvider>
    </main>
  );
}