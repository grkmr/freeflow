import type { NodeTypes } from "@xyflow/react";
import { RectangleNode } from "./Rectangle";

export const NODE_TYPES = {
	rectangle: RectangleNode,
} as const satisfies NodeTypes;

export type NodeKeys = keyof typeof NODE_TYPES;
