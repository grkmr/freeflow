import {
	type FitViewOptions,
	type Node,
	useNodesInitialized,
	useReactFlow,
} from "@xyflow/react";
import { useEffect, useRef } from "react";
import type { LayoutEdgeType } from "../../edges/edge";
import { clipEdgesToShapes } from "./clipToShape";
import { elkLayout } from "./engines/elk";

const LAYOUT_ENGINE_MAP = {
	elk: elkLayout,
};

type UseLayoutProps = {
	engine: keyof typeof LAYOUT_ENGINE_MAP;
	nodes: Node[];
	edges: LayoutEdgeType[];
	layoutOptions?: Record<string, string> | undefined;
	// Fits the view once a layout is applied; the nodes only get their
	// positions then, so React Flow's own initial fitView sees them at (0, 0).
	fitView?: boolean | undefined;
	fitViewOptions?: FitViewOptions | undefined;
};

export const useLayout = ({
	engine,
	nodes,
	edges,
	layoutOptions,
	fitView,
	fitViewOptions,
}: UseLayoutProps) => {
	const { getNodes, setNodes, setEdges, fitView: fitViewport } = useReactFlow();
	const nodesInitialized = useNodesInitialized();

	const layoutFunction = LAYOUT_ENGINE_MAP[engine];

	const fitViewRef = useRef({ fitView, fitViewOptions });
	fitViewRef.current = { fitView, fitViewOptions };

	useEffect(() => {
		if (!nodesInitialized) return;

		const current = new Map(getNodes().map((node) => [node.id, node]));
		const merged = nodes.map((node) => {
			const previous = current.get(node.id);
			return previous
				? {
						...node,
						position: previous.position,
						...(previous.measured && { measured: previous.measured }),
					}
				: node;
		});

		if (merged.some((node) => node.measured?.width === undefined)) {
			setNodes(merged);
			return;
		}

		let cancelled = false;

		layoutFunction(merged, edges, layoutOptions).then((result) => {
			if (cancelled) return;
			setNodes(result.nodes);
			setEdges(clipEdgesToShapes(result.edges, result.nodes));
			const { fitView, fitViewOptions } = fitViewRef.current;
			if (fitView) fitViewport(fitViewOptions);
		});

		return () => {
			cancelled = true;
		};
	}, [
		nodesInitialized,
		layoutFunction,
		nodes,
		edges,
		layoutOptions,
		getNodes,
		setNodes,
		setEdges,
		fitViewport,
	]);
};
