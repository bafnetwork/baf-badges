import { BafBadge } from '../utils/badgeTypes';
import styles from '../styles/Home.module.css';
import Image from 'next/image';

export function BadgeCard(badge: BafBadge) {
	return (
		<div className={styles.card} key={badge.onChain.token_id}>
			<div className={styles.cardImgContainer}>
				<Image src={badge.onChain.metadata.media} alt={badge.onChain.token_id} layout="fill" objectFit="scale-down"/>
			</div>
			<h3>{badge.onChain.metadata.title}</h3>
			<p>{badge.onChain.metadata.description}</p>
		</div>
	)
}