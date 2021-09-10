import { useEffect, useMemo, useState, useRef } from 'react';
import { getLesson, getRootLessonUrls, LessonNode, nodeToRef } from '../utils/lesson';
import * as React from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
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



// this is stupid. It is only temporary until we can come up with a good graph editor solution
export function LessonGraph() {
	const [currentNode, setCurrentNode] = useState<LessonNode | null>(null);
	const [nodeCache, setNodeCache] = useState<NodeCache>({});

	const graphContainer = useRef<HTMLDivElement>(null);
	const graph = useRef<cytoscape.Core>();
	const layout = useRef<cytoscape.Layouts>();

	// fetch initial nodes
	// for now, just flood fill the entire graph.
	// eventually, we want this to lazy-load and garbage collect
	// based on viewport distance (i.e. cache policy "furthest from view")
	useEffect(() => {
		(async () => {
			const cache: NodeCache = {};
			const rootLessonUrls = await getRootLessonUrls();

			const proms = rootLessonUrls.map(async (url, i) => {
				const node = await getLesson(url);
				cache[node.lessonID] = node;

				await fetchEntireGraph(node, cache);
			});

			await Promise.all(proms);
			setNodeCache(cache);
		})()
	}, []);

	// update graph and layout
	useEffect(() => {
		if (graph.current) {
			if (layout.current) {
				layout.current.stop();
		  	}

			// TODO: memoize this somehow
			const elements: cytoscape.ElementDefinition[] = Object.values(nodeCache).flatMap(node => [
					{
						data: { id: node.lessonID }
					},
					...node.dependencies.map(ref => ({
						data: {
							id: `${node.lessonID}-${ref.lessonID()}`,
							source: `${node.lessonID}`,
							target: `${ref.lessonID()}`
						}
					}))
			]);

			graph.current.add(elements);
			layout.current = graph.current.elements().makeLayout({
				name: "dagre"
			});
			layout.current.run();
		}
	}, [nodeCache]);

	// init the graph
	useEffect(() => {
		if (!graphContainer.current) {
		  return;
		}
		
		try {
			if (!graph.current) {
				cytoscape.use(dagre);
				graph.current = cytoscape({
					elements: [],
					maxZoom: 1,
					wheelSensitivity: 0.2,
					container: graphContainer.current
				});
			}
		} catch (error) {
			console.error(error);
		}
		return () => {
			graph.current && graph.current.destroy();
		};
	  }, []);

	return (
		<div>
			<Title>Lessons</Title>

			<div className="graph" ref={graphContainer} />;
		</div>
	)
}