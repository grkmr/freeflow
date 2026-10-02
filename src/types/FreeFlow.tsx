import type { EdgeMarkerType, Node } from "@xyflow/react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type Position = {
	x: number;
	y: number;
};

export type EdgeType = {
	id: string;
	source: string;
	target: string;
	style?: CSSProperties;
	animated?: boolean;
	markerStart?: EdgeMarkerType;
	markerEnd?: EdgeMarkerType;
	label?: ReactNode;
	startLabel?: ReactNode;
	endLabel?: ReactNode;
	onClick?: ((edge: EdgeType, event: MouseEvent<Element>) => void) | undefined;
	clickIcon?: ReactNode;
};

export type NodeShape = "rectangle" | "circle";

type NodeData = Record<string, unknown>;

export type RectangleNode<
	Data extends NodeData = NodeData,
	Type extends string | undefined = string | undefined,
> = Node<Data & { shape: "rectangle" }, Type>;

export type CircleNode<
	Data extends NodeData = NodeData,
	Type extends string | undefined = string | undefined,
> = Node<Data & { shape: "circle" }, Type>;

export type FreeFlowNode = RectangleNode | CircleNode;
