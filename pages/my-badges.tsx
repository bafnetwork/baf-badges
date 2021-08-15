import styles from '../styles/MyBadges.module.scss';
import { Layout, PageName } from '../components/Layout/Layout';
import { withNearWallet } from '../components/withNearWallet';
import { Footer } from '../components/Footer/Footer';
import { BafBadge } from '../utils/badgeTypes';
import { getAllBadgesForOwner } from '../utils/badge';
import { useState, useEffect } from 'react';
import { BadgeCard } from '../components/BadgeCard/BadgeCard';
import { Typography } from 'antd';

const { Title } = Typography;

function MyBadges() {
	const [badges, setBadges] = useState<BafBadge[]>([]);

	useEffect(() => {
		getAllBadgesForOwner(window.accountId).then(setBadges);
	}, []);

	return (
		<div className={styles.container}>
			<Title>My Badges</Title>

			<div>
				{ badges.map(BadgeCard) }	
			</div>
		</div>
	);
}

const GetLayout = (page: any) => {
	<Layout page={PageName.MY_BADGES}>
		{ page }
	</Layout>
}

MyBadges.getLayout = GetLayout;

export default withNearWallet(MyBadges);
