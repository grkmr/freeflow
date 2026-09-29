import {
	Background,
	Controls,
	ReactFlow,
	type Node,
	ReactFlowProvider,
	type Edge,
} from "@xyflow/react";
import styles from "./FreeFlow.module.css";
import "@xyflow/react/dist/style.css";
import { NODE_TYPES } from "./nodes";
import type { EdgeType, NodeType } from "./types/FreeFlow";
import { useMemo } from "react";

type FreeFlowProps = {
	nodes: NodeType[];
	edges: EdgeType[];
};

const InnerFlow = ({ nodes, edges }: FreeFlowProps) => {
	const initialNodes: Node[] = useMemo(
		() => nodes.map((node) => ({ ...node, data: {} }) satisfies Node),
		[nodes],
	);

	const initialEdges: Edge[] = useMemo(
		() => edges.map((edge) => ({ ...edge, data: {} }) satisfies Edge),
		[edges],
	);

	return (
		<ReactFlow
			className={styles["freeFlow"]}
			nodeTypes={NODE_TYPES}
			nodes={initialNodes}
			edges={initialEdges}
		>
			<Background />
			<Controls />
		</ReactFlow>
	);
};

export const FreeFlow = (props: FreeFlowProps) => {
	return (
		<ReactFlowProvider>
			<InnerFlow {...props} />
		</ReactFlowProvider>
	);
};
