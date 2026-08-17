import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type Node = {
	id: string;
	position: { x: number; y: number };
	data: { label: string };
};

export type Edge = {
	id: string;
	source: string;
	target: string;
};

type FreeFlowProps = {
	nodes?: Node[];
	edges?: Edge[];
};

export const FreeFlow = ({ nodes = [], edges = [] }: FreeFlowProps) => {
	return (
		<ReactFlow nodes={nodes} edges={edges}>
			<Background />
			<Controls />
		</ReactFlow>
	);
};
