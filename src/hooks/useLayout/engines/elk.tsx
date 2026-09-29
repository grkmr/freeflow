import type { Edge, Node } from "@xyflow/react";
import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

export const elkLayout = async (
	nodes: Node[],
	edges: Edge[],
	layoutOptions?: Record<string, string>,
) => {
	const graph: ElkNode = {
		id: "root",
		layoutOptions: layoutOptions ?? {},
		children: nodes.map((node) => ({
			...node,
			width: node.measured?.width ?? 0,
			height: node.measured?.height ?? 0,
		})),
		edges: edges.map(({ id, source, target }) => ({
			id,
			sources: [source],
			targets: [target],
		})),
	};

	return await elk.layout(graph);
};
