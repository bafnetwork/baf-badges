/* eslint-disable @next/next/no-img-element */
import { BafBadge } from '../../utils/badgeTypes';
import Link from 'next/link';
import { Card, Typography } from 'antd'
import { Markdown } from '../Markdown';
import { LessonNode } from '../../utils/lesson';
import { EllipsisOutlined } from '@ant-design/icons';

const { Title } = Typography;

export function LessonCard(lesson: LessonNode) {
	const { lessonID, title } = lesson;

	return (
		<Card
			style={{ maxWidth: 400 }}
			key={lessonID}
			actions={[
				<Link key="open" href={`/lessons/${lessonID}`}>
					<a><EllipsisOutlined/></a>
				</Link>
			]}
		>
			<Title level={3} style={{ paddingBottom: '0.5rem'}}>{title}</Title>
		</Card>
	)
}