import type { Node } from "@xyflow/react";
import type { LayoutEdgeType } from "../../edges/edge";
import type { Position } from "../../types/FreeFlow";

type Ellipse = { center: Position; rx: number; ry: number };

const getEllipse = (node: Node): Ellipse | undefined => {
	const width = node.measured?.width;
	const height = node.measured?.height;
	if (!width || !height) return undefined;

	return {
		center: { x: node.position.x + width / 2, y: node.position.y + height / 2 },
		rx: width / 2,
		ry: height / 2,
	};
};

const clipToEllipse = (
	point: Position,
	direction: Position,
	{ center, rx, ry }: Ellipse,
): Position => {
	const px = (point.x - center.x) / rx;
	const py = (point.y - center.y) / ry;
	const dx = direction.x / rx;
	const dy = direction.y / ry;

	const a = dx * dx + dy * dy;
	const b = 2 * (px * dx + py * dy);
	const c = px * px + py * py - 1;

	if (c <= 0) return point;

	const discriminant = b * b - 4 * a * c;
	const t =
		a > 0 && discriminant >= 0 ? (-b - Math.sqrt(discriminant)) / (2 * a) : -1;

	if (t >= 0) {
		return { x: point.x + t * direction.x, y: point.y + t * direction.y };
	}

	const length = Math.hypot(px, py);
	return { x: center.x + (px / length) * rx, y: center.y + (py / length) * ry };
};

export const clipEdgesToShapes = (
	edges: LayoutEdgeType[],
	nodes: Node[],
): LayoutEdgeType[] => {
	const ellipses = new Map<string, Ellipse>();
	for (const node of nodes) {
		if (node.data["shape"] === "circle") {
			const ellipse = getEllipse(node);
			if (ellipse) ellipses.set(node.id, ellipse);
		}
	}
	if (ellipses.size === 0) return edges;

	return edges.map((edge) => {
		const route = edge.data?.route;
		if (!route) return edge;

		const { startPoint, endPoint, bendPoints } = route;
		const source = ellipses.get(edge.source);
		const target = ellipses.get(edge.target);
		if (!source && !target) return edge;

		const afterStart = bendPoints[0] ?? endPoint;
		const beforeEnd = bendPoints.at(-1) ?? startPoint;

		return {
			...edge,
			data: {
				...edge.data,
				route: {
					...route,
					startPoint: source
						? clipToEllipse(
								startPoint,
								{
									x: startPoint.x - afterStart.x,
									y: startPoint.y - afterStart.y,
								},
								source,
							)
						: startPoint,
					endPoint: target
						? clipToEllipse(
								endPoint,
								{ x: endPoint.x - beforeEnd.x, y: endPoint.y - beforeEnd.y },
								target,
							)
						: endPoint,
				},
			},
		};
	});
};
