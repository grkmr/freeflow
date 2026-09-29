import { useReactFlow } from "@xyflow/react";
import { elkLayout } from "./engines/elk";
import { useCallback, useEffect } from "react";

const LAYOUT_ENGINE_MAP = {
	elk: elkLayout,
};

type UseLayoutProps = {
	engine: keyof typeof LAYOUT_ENGINE_MAP;
	layoutOptions?: Record<string, any>;
};

export const useLayout = ({ engine, layoutOptions }: UseLayoutProps) => {
	const { getNodes, getEdges } = useReactFlow();

	const layoutFunction = LAYOUT_ENGINE_MAP[engine];

	const layout = useCallback(async () => {
		const nodes = getNodes();
		const edges = getEdges();

		const result = await layoutFunction(nodes, edges, layoutOptions);
	}, []);
};
