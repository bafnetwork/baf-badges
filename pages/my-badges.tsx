import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { withNearWallet } from '../components/withNearWallet';
import { Footer } from '../components/Footer';
import { BafBadge } from '../utils/badgeTypes';
import { getAllBadgesForOwner } from '../utils/badge';
import { useState, useEffect } from 'react';
import { BadgeCard } from '../components/badgeCard';

function MyBadges() {
	const [badges, setBadges] = useState<BafBadge[]>([]);

	useEffect(() => {
		getAllBadgesForOwner(window.accountId).then(setBadges);
	}, []);

	return (
		<div className={styles.container}>
			<Head>
				<title>My Badges</title>
				<meta name="description" content="BAF Badges View Badges Page" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>
					My Badges
				</h1>

				<div className={styles.grid}>
					{ badges.map(BadgeCard) }	
				</div>

			</main>

			<Footer/>
		</div>
	);
}

export default withNearWallet(MyBadges);
