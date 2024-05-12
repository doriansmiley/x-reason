"use client"

import Image from 'next/image'
import Link from 'next/link';

import styles from '@/app/page.module.css';

export default function Home() {

  return (
    <main className={styles.main}>
      <h1>Welcome to X-Reason!</h1>
      <p>We have prepared some examples of custom reasoning engines you can explore below</p>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.description}>
            <h3>Chemli</h3>
          </div>
          <p>
            This reasoning engine has been trained on notional steps to perform chemical product engineering.
            The training data is purely notional based on some interviews with a chemical product engineer.
            Click <Link href="/pages/chemli">here</Link> to launch the demo.
          </p>
        </div>
      </div>

    </main>
  )
}
