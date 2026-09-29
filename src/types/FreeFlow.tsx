import type { NodeKeys } from "../nodes";

export type NodeType = {
	type: NodeKeys;
	id: string;
	label: string;
	position: { x: number; y: number };
};

export type EdgeType = {
	id: string;
	source: string;
	target: string;
};
