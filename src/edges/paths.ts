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

export const toPolyline = (
	points: Position[],
	routing: EdgeRouting,
	samplesPerCurve = 16,
): Position[] => {
	const [start, ...rest] = points;
	if (routing !== "SPLINES" || !start || rest.length % 3 !== 0) return points;

	const polylinePoints = [start];
	let from = start;
	for (let i = 0; i < rest.length; i += 3) {
		const [c1, c2, to] = rest.slice(i, i + 3) as [Position, Position, Position];
		for (let step = 1; step <= samplesPerCurve; step++) {
			const t = step / samplesPerCurve;
			const u = 1 - t;
			const a = u * u * u;
			const b = 3 * u * u * t;
			const c = 3 * u * t * t;
			const d = t * t * t;
			polylinePoints.push({
				x: a * from.x + b * c1.x + c * c2.x + d * to.x,
				y: a * from.y + b * c1.y + c * c2.y + d * to.y,
			});
		}
		from = to;
	}
	return polylinePoints;
};

export const getLength = (polyline: Position[]) =>
	polyline.reduce(
		(length, point, i) =>
			i === 0
				? 0
				: length +
					Math.hypot(
						point.x - (polyline[i - 1] as Position).x,
						point.y - (polyline[i - 1] as Position).y,
					),
		0,
	);

export const getPointAlong = (polyline: Position[], distance: number) => {
	let remaining = Math.max(0, distance);
	for (let i = 1; i < polyline.length; i++) {
		const from = polyline[i - 1] as Position;
		const to = polyline[i] as Position;
		const length = Math.hypot(to.x - from.x, to.y - from.y);
		if (length === 0) continue;

		const direction = {
			x: (to.x - from.x) / length,
			y: (to.y - from.y) / length,
		};
		if (remaining <= length || i === polyline.length - 1) {
			const t = Math.min(remaining, length);
			return {
				point: { x: from.x + direction.x * t, y: from.y + direction.y * t },
				direction,
			};
		}
		remaining -= length;
	}
	return { point: polyline[0] ?? { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
};

export const getDistanceAlong = (polyline: Position[], target: Position) => {
	let best = { distanceToLine: Number.POSITIVE_INFINITY, along: 0 };
	let travelled = 0;
	for (let i = 1; i < polyline.length; i++) {
		const from = polyline[i - 1] as Position;
		const to = polyline[i] as Position;
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const lengthSquared = dx * dx + dy * dy;
		const length = Math.sqrt(lengthSquared);
		if (length === 0) continue;

		const t = Math.max(
			0,
			Math.min(
				1,
				((target.x - from.x) * dx + (target.y - from.y) * dy) / lengthSquared,
			),
		);
		const distanceToLine = Math.hypot(
			from.x + dx * t - target.x,
			from.y + dy * t - target.y,
		);
		if (distanceToLine < best.distanceToLine) {
			best = { distanceToLine, along: travelled + t * length };
		}
		travelled += length;
	}
	return best.along;
};
