import {
	Background,
	Controls,
	type Edge,
	type EdgeTypes,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import styles from "./FreeFlow.module.css";
import "@xyflow/react/dist/style.css";
import { type ComponentProps, useMemo } from "react";
import { LayoutEdge, type LayoutEdgeType } from "./edges/edge";
import { EdgeMarkerDefinitions } from "./edges/markers";
import { useLayout } from "./hooks/useLayout";
import { DEFAULT_LAYOUT_OPTIONS } from "./hooks/useLayout/config";
import type { EdgeType, FreeFlowNode } from "./types/FreeFlow";

type FreeFlowProps = {
	edges: EdgeType[];
	layoutOptions?: Record<string, string> | undefined;
	defaultNodes?: FreeFlowNode[] | undefined;
} & Omit<
	ComponentProps<typeof ReactFlow>,
	| "edges"
	| "defaultEdges"
	| "nodes"
	| "defaultNodes"
	| "nodesDraggable"
	| "edgeTypes"
>;

const EDGE_TYPES = {
	layout: LayoutEdge,
} as const satisfies EdgeTypes;

const InnerFlow = ({
	edges,
	layoutOptions = DEFAULT_LAYOUT_OPTIONS,
	defaultNodes,
	...props
}: FreeFlowProps) => {
	const initialEdges: Edge[] = useMemo(
		() =>
			edges.map((original) => {
				const { startLabel, endLabel, onClick, clickIcon, ...edge } = original;
				return {
					...edge,
					type: "layout",
					data: {
						startLabel,
						endLabel,
						onClick: onClick && ((event) => onClick(original, event)),
						clickIcon,
					},
				} satisfies LayoutEdgeType;
			}),
		[edges],
	);

	useLayout({ engine: "elk", layoutOptions });

	return (
		<ReactFlow
			className={styles["freeFlow"]}
			nodesDraggable={false}
			edgeTypes={EDGE_TYPES}
			{...(defaultNodes && { defaultNodes })}
			defaultEdges={initialEdges}
			{...props}
		>
			<EdgeMarkerDefinitions />
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
