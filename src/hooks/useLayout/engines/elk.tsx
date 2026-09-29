import type { Edge, Node } from "@xyflow/react";
import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import type { LayoutEdgeType } from "../../../edges/edge";
import { isEdgeRouting } from "../../../edges/paths";

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
	const layoutResult = await elk.layout(graph);

	// Render the bend points the same way ELK routed them (layered defaults to ORTHOGONAL).
	const edgeRouting = layoutOptions?.["elk.edgeRouting"];
	const routing = isEdgeRouting(edgeRouting) ? edgeRouting : "ORTHOGONAL";

	const positions = new Map(
		layoutResult.children?.map(({ id, x, y }) => [
			id,
			{ x: x ?? 0, y: y ?? 0 },
		]),
	);

	return {
		nodes: nodes.map<Node>((node) => ({
			...node,
			position: positions.get(node.id) ?? node.position,
		})),
		edges: layoutResult.edges?.map<LayoutEdgeType>(
			({ id, sources, targets, sections }) => ({
				source: sources[0] ?? "",
				target: targets[0] ?? "",
				id: id,
				type: "layout",
				data: {
					startPoint: sections?.[0]?.startPoint ?? { x: 0, y: 0 },
					endPoint: sections?.[0]?.endPoint ?? { x: 0, y: 0 },
					bendPoints: sections?.[0]?.bendPoints ?? [],
					routing,
				},
			}),
		),
	};
};
