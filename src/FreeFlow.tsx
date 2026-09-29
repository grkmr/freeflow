import {
	Background,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	type Edge,
	type EdgeTypes,
} from "@xyflow/react";
import styles from "./FreeFlow.module.css";
import "@xyflow/react/dist/style.css";
import type { EdgeType } from "./types/FreeFlow";
import { useMemo, type ComponentProps } from "react";
import { useLayout } from "./hooks/useLayout";
import { DEFAULT_LAYOUT_OPTIONS } from "./hooks/useLayout/config";
import { LayoutEdge, type LayoutEdgeType } from "./edges/edge";

type FreeFlowProps = {
	edges: EdgeType[];
	layoutOptions?: Record<string, string> | undefined;
} & Omit<
	ComponentProps<typeof ReactFlow>,
	"edges" | "defaultEdges" | "nodesDraggable" | "edgeTypes"
>;

const EdgeTypes = {
	layout: LayoutEdge,
} as const satisfies EdgeTypes;

const InnerFlow = ({
	edges,
	layoutOptions = DEFAULT_LAYOUT_OPTIONS,
	...props
}: FreeFlowProps) => {
	const initialEdges: Edge[] = useMemo(
		() =>
			edges.map(
				(edge) => ({ ...edge, type: "layout" }) satisfies LayoutEdgeType,
			),
		[edges],
	);

	useLayout({ engine: "elk", layoutOptions });

	return (
		<ReactFlow
			className={styles["freeFlow"]}
			nodesDraggable={false}
			edgeTypes={EdgeTypes}
			defaultEdges={initialEdges}
			{...props}
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
