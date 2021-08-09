import Head from 'next/head';
import Image from 'next/image';
import { Footer } from '../components/Footer';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { LoadingOutlined } from '@ant-design/icons';

function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>BAF Badges</title>
        <meta name="description" content="BAF Badges Landing Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to BAF Badges!
        </h1>

        <LoadingOutlined />

        <div className={styles.grid}>
          <Link passHref href="/my-badges">
            <a className={styles.card}>
                <h2>My Badges &rarr;</h2>
                <p>View your badges.</p>
            </a>
          </Link>

          <Link passHref href="/graph">
            <a className={styles.card}>
                <h2>Badge Graph &rarr;</h2>
                <p>Coming soon!</p>
            </a>
          </Link>

          <Link passHref href="/mint-badges">
            <a className={styles.card}>
                <h2>Mint Badges &rarr;</h2>
                <p>Coming soon!</p>
            </a>
          </Link>

          <Link passHref href="/about">
            <a className={styles.card}>
                <h2>About BAF Badges &rarr;</h2>
                <p>Coming soon!</p>
            </a>
          </Link>
        </div>
      </main>


	    <Footer/>
    </div>
  );
}

export default Home;
