import { useEffect, useMemo, useState } from 'react';
import { getLesson, LessonNode, nodeToRef } from '../utils/lesson';
import { Typography } from 'antd';
import BN from 'bn.js';
import { LessonCard } from '../components/LessonCard/LessonCard';

const { Title } = Typography;

interface NodeCache {
	[name: string]: LessonNode;
}

async function fetchEntireGraph(node: LessonNode, cache: NodeCache, depth = 0) {
	// set max depth
	// lazy way of dealing with circles (which should be avoided somewhere else)
	if (depth > 10) {
		return;
	}
	
	const dependencyProms = node.dependents.map(async dep => {
		if (!dep.isLessonID()) {
			return dep;
		}
		if (cache[dep.lessonID()]) {
			return nodeToRef(cache[dep.lessonID()]);
		} 

		const node = await dep.get();
		cache[dep.lessonID()] = node;
		await fetchEntireGraph(node, cache, depth + 1);
		return nodeToRef(node);
	});

	const dependentProms = node.dependents.map(async dep => {
		if (!dep.isLessonID()) {
			return dep;
		}
		if (cache[dep.lessonID()]) {
			return nodeToRef(cache[dep.lessonID()]);
		} 

		const node = await dep.get();
		cache[dep.lessonID()] = node;
		await fetchEntireGraph(node, cache, depth + 1);
		return nodeToRef(node);
	});
	
	const [dependencies, dependents] = await Promise.all([
		Promise.all(dependencyProms),
		Promise.all(dependentProms),
	]);

	node.dependencies = dependencies;
	node.dependents = dependents;
}

// this is lazy and stupid. It is only temporary until we can come up with a good graph editor solution
export function LessonGraph() {
	const [node, setNode] = useState<LessonNode | null>(null);
	const [nodeCache, setNodeCache] = useState<NodeCache>({});

	useEffect(() => {
		(async () => {
			// right now, just flood fill the entire graph.
			const cache: NodeCache = {};

			const node = await getLesson((new BN(0)).toString())
			cache[node.lessonID] = node;
			await fetchEntireGraph(node, cache);
			setNodeCache(cache);
			setNode(node)
		})()
	}, []);

	const lessons = useMemo<LessonNode[]>(() => Object.values(nodeCache), [nodeCache]);

	return (
		<div>
			<Title>Lessons</Title>

			<div>
				{ lessons.map(LessonCard) }
			</div>
		</div>
	)
}