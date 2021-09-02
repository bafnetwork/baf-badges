/* eslint-disable @next/next/no-img-element */
import { BafBadge } from '../../utils/badgeTypes';
import { Card, Typography } from 'antd'
import { Markdown } from '../Markdown';

const { Title } = Typography;

export function BadgeCard(badge: BafBadge) {
	const tokenID = badge.onChain.token_id;
	const { media, title, description } = badge.onChain.metadata;
	return (
		<Card
			style={{ maxWidth: 400 }}
			cover={
				<img
					src={media}
					alt={tokenID}
					// layout="fill"
				/>
			}
			key={badge.onChain.token_id}
		>
			<Title level={3} style={{ paddingBottom: '0.5rem'}}>{title}</Title>
			<Markdown md={description}/>
		</Card>
	)
}