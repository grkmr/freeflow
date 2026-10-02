import { useNodesInitialized, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import type { LayoutEdgeType } from "../../edges/edge";
import { clipEdgesToShapes } from "./clipToShape";
import { elkLayout } from "./engines/elk";

const LAYOUT_ENGINE_MAP = {
	elk: elkLayout,
};

type UseLayoutProps = {
	engine: keyof typeof LAYOUT_ENGINE_MAP;
	layoutOptions?: Record<string, string> | undefined;
};

export const useLayout = ({ engine, layoutOptions }: UseLayoutProps) => {
	const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
	const nodesInitialized = useNodesInitialized();

	const layoutFunction = LAYOUT_ENGINE_MAP[engine];

	const layout = useCallback(async () => {
		const result = await layoutFunction(
			getNodes(),
			getEdges() as LayoutEdgeType[],
			layoutOptions,
		);

		setNodes(result.nodes);
		setEdges(clipEdgesToShapes(result.edges, result.nodes));
	}, [layoutFunction, layoutOptions, getNodes, getEdges, setNodes, setEdges]);

	useEffect(() => {
		if (nodesInitialized) layout();
	}, [nodesInitialized, layout]);
};
