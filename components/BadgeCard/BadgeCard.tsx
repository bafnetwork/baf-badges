import { BafBadge } from '../../utils/badgeTypes';
import { Card } from 'antd'
import Image from 'next/image';


const { Meta } = Card;

export function BadgeCard(badge: BafBadge) {
	const tokenID = badge.onChain.token_id;
	const { media, title, description } = badge.onChain.metadata;
	return (
		<Card
			cover={
				<Image
					src={media}
					alt={tokenID}
					layout="fill"
					objectFit="scale-down"
				/>
			}
			key={badge.onChain.token_id}
		>
			<Meta title={title} description={description}/>
		</Card>
	)
}