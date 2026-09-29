import type { Position } from "../types/FreeFlow";

export type EdgeRouting = "ORTHOGONAL" | "POLYLINE" | "SPLINES";

type PathBuilder = (points: Position[]) => string;

const polyline: PathBuilder = (points) =>
	points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

const splines: PathBuilder = (points) => {
	const [start, ...rest] = points;
	if (!start || rest.length % 3 !== 0) return polyline(points);

	let path = `M ${start.x} ${start.y}`;
	for (let i = 0; i < rest.length; i += 3) {
		const [control1, control2, end] = rest.slice(i, i + 3) as [
			Position,
			Position,
			Position,
		];
		path += ` C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`;
	}
	return path;
};

export const EDGE_PATH_BUILDERS = {
	ORTHOGONAL: polyline,
	POLYLINE: polyline,
	SPLINES: splines,
} as const satisfies Record<EdgeRouting, PathBuilder>;

export const isEdgeRouting = (value: unknown): value is EdgeRouting =>
	typeof value === "string" && value in EDGE_PATH_BUILDERS;
