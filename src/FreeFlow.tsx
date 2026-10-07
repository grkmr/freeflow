import {
	Background,
	Controls,
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
	nodes: FreeFlowNode[];
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
	nodes,
	fitView,
	fitViewOptions,
	...props
}: FreeFlowProps) => {
	const layoutEdges: LayoutEdgeType[] = useMemo(
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

	useLayout({
		engine: "elk",
		nodes,
		edges: layoutEdges,
		layoutOptions,
		fitView,
		fitViewOptions,
	});

	return (
		<ReactFlow
			className={styles["freeFlow"]}
			nodesDraggable={false}
			edgeTypes={EDGE_TYPES}
			defaultNodes={nodes}
			defaultEdges={layoutEdges}
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
