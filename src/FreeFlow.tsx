import { Background, Controls, ReactFlow } from "@xyflow/react";
import styles from "./FreeFlow.module.css";
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
		<ReactFlow className={styles["freeFlow"]} nodes={nodes} edges={edges}>
			<Background />
			<Controls />
		</ReactFlow>
	);
};
