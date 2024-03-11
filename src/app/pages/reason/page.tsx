import { ReasonDemo } from "@/app/components";
import styles from "./page.module.css";

export default function IndexPage() {
  return (
    <main className={styles.main}>
      <ReasonDemo />
    </main>
  );
}