import {
	BaseEdge,
	type Edge,
	EdgeLabelRenderer,
	type EdgeProps,
	Position as HandlePosition,
	type InternalNode,
	useInternalNode,
	useStore,
} from "@xyflow/react";
import type { MouseEvent, ReactNode } from "react";
import type { Position } from "../types/FreeFlow";
import styles from "./edge.module.css";
import { measureLabel } from "./labels";
import {
	EDGE_PATH_BUILDERS,
	type EdgeRouting,
	getDistanceAlong,
	getLength,
	getPointAlong,
	toPolyline,
} from "./paths";

export type EdgeLabelKind = "start" | "end" | "center";

export type EdgeRoute = {
	startPoint: Position;
	endPoint: Position;
	bendPoints: Position[];
	routing: EdgeRouting;
	labels?: Partial<Record<EdgeLabelKind, Position>>;
};

export type LayoutEdgeType = Edge<
	{
		route?: EdgeRoute;
		startLabel?: ReactNode;
		endLabel?: ReactNode;
		onClick?: ((event: MouseEvent<Element>) => void) | undefined;
		clickIcon?: ReactNode;
	},
	"layout"
>;

export const hasClickIcon = (data: LayoutEdgeType["data"]) =>
	Boolean(data?.onClick) && data?.clickIcon !== null;

const InfoIcon = () => (
	<svg viewBox="0 0 12 12" aria-hidden="true">
		<circle cx="6" cy="6" r="5.5" fill="currentColor" />
		<rect x="5.25" y="5" width="1.5" height="4" rx="0.5" fill="#ffffff" />
		<circle cx="6" cy="3.4" r="0.85" fill="#ffffff" />
	</svg>
);

const END_LABEL_DISTANCE = 20;
const MIN_END_LABEL_DISTANCE = 14;

const getSelfLoopRoute = (node: InternalNode, index: number): EdgeRoute => {
	const { x, y } = node.internals.positionAbsolute;
	const width = node.measured.width ?? 0;
	const height = node.measured.height ?? 0;

	const right = x + width;
	const centerY = y + height / 2;
	const gap = Math.min(8 + index * 6, height / 2 - 2);
	const size = 30 + index * 15;

	return {
		startPoint: { x: right, y: centerY - gap },
		bendPoints: [
			{ x: right + size, y: centerY - gap - size },
			{ x: right + size, y: centerY + gap + size },
		],
		endPoint: { x: right, y: centerY + gap },
		routing: "SPLINES",
	};
};

const HANDLE_DIRECTIONS: Record<HandlePosition, Position> = {
	[HandlePosition.Top]: { x: 0, y: -1 },
	[HandlePosition.Bottom]: { x: 0, y: 1 },
	[HandlePosition.Left]: { x: -1, y: 0 },
	[HandlePosition.Right]: { x: 1, y: 0 },
};

const getHandleRoute = ({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps<LayoutEdgeType>): EdgeRoute => {
	const curvature = Math.max(
		25,
		Math.hypot(targetX - sourceX, targetY - sourceY) / 3,
	);
	const out = HANDLE_DIRECTIONS[sourcePosition];
	const into = HANDLE_DIRECTIONS[targetPosition];

	return {
		startPoint: { x: sourceX, y: sourceY },
		bendPoints: [
			{ x: sourceX + out.x * curvature, y: sourceY + out.y * curvature },
			{ x: targetX + into.x * curvature, y: targetY + into.y * curvature },
		],
		endPoint: { x: targetX, y: targetY },
		routing: "SPLINES",
	};
};

const overlapsNode = (
	center: Position,
	size: { width: number; height: number },
	node: InternalNode | undefined,
) => {
	if (!node) return false;
	const gap = 2;
	const { x, y } = node.internals.positionAbsolute;
	return (
		center.x + size.width / 2 + gap > x &&
		center.x - size.width / 2 - gap < x + (node.measured.width ?? 0) &&
		center.y + size.height / 2 + gap > y &&
		center.y - size.height / 2 - gap < y + (node.measured.height ?? 0)
	);
};

const EdgeLabel = ({
	x,
	y,
	onClick,
	children,
}: Position & {
	onClick?: ((event: MouseEvent<Element>) => void) | undefined;
	children: ReactNode;
}) => {
	const style = {
		transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
	};
	const className = `nodrag nopan ${styles["label"]}`;

	return onClick ? (
		<button
			type="button"
			className={`${className} ${styles["clickable"]}`}
			style={style}
			onClick={onClick}
		>
			{children}
		</button>
	) : (
		<div className={className} style={style}>
			{children}
		</div>
	);
};

export const LayoutEdge = ({ data, ...props }: EdgeProps<LayoutEdgeType>) => {
	const sourceNode = useInternalNode(props.source);
	const targetNode = useInternalNode(props.target);
	const isSelfLoop = props.source === props.target;

	const loopIndex = useStore((state) =>
		isSelfLoop
			? state.edges
					.filter(
						({ source, target }) =>
							source === props.source && target === props.source,
					)
					.findIndex(({ id }) => id === props.id)
			: 0,
	);

	const route =
		data?.route ??
		(isSelfLoop && sourceNode
			? getSelfLoopRoute(sourceNode, Math.max(0, loopIndex))
			: getHandleRoute(props));

	const points = [route.startPoint, ...route.bendPoints, route.endPoint];
	const edgePath = EDGE_PATH_BUILDERS[route.routing](points);

	const { label } = props;
	const { startLabel, endLabel, onClick } = data ?? {};
	const icon = hasClickIcon(data) ? (data?.clickIcon ?? <InfoIcon />) : null;
	const hasCenter = label != null || icon != null;
	const hasLabels = hasCenter || startLabel != null || endLabel != null;

	const polyline = hasLabels ? toPolyline(points, route.routing) : [];
	const length = getLength(polyline);
	const minEndDistance = Math.min(MIN_END_LABEL_DISTANCE, length / 3);
	const labelAt = (
		kind: EdgeLabelKind,
		content: ReactNode,
		fallbackDistance: number,
	) => {
		const placed = route.labels?.[kind];
		let distance = placed
			? getDistanceAlong(polyline, placed)
			: fallbackDistance;
		if (kind === "center") return getPointAlong(polyline, distance).point;

		distance = Math.min(
			Math.max(distance, minEndDistance),
			length - minEndDistance,
		);

		const node = kind === "start" ? sourceNode : targetNode;
		const step = kind === "start" ? 2 : -2;
		const size = measureLabel(content);
		while (
			distance > 0 &&
			distance < length &&
			overlapsNode(getPointAlong(polyline, distance).point, size, node)
		) {
			distance += step;
		}
		return getPointAlong(polyline, distance).point;
	};
	const endDistance = Math.min(END_LABEL_DISTANCE, length / 3);

	const { id, style, markerStart, markerEnd, interactionWidth } = props;
	const baseEdge = (
		<BaseEdge
			id={id}
			path={edgePath}
			style={style}
			{...(markerStart && { markerStart })}
			{...(markerEnd && { markerEnd })}
			interactionWidth={interactionWidth ?? 20}
		/>
	);

	return (
		<>
			{onClick ? (
				// biome-ignore lint/a11y/noStaticElementInteractions: keyboard users use the label / icon buttons
				<g className={styles["clickableEdge"]} onClick={onClick}>
					{baseEdge}
				</g>
			) : (
				baseEdge
			)}
			{hasLabels && (
				<EdgeLabelRenderer>
					{hasCenter && (
						<EdgeLabel
							{...labelAt("center", label, length / 2)}
							onClick={onClick}
						>
							{label}
							{icon != null && <span className={styles["icon"]}>{icon}</span>}
						</EdgeLabel>
					)}
					{startLabel != null && (
						<EdgeLabel
							{...labelAt("start", startLabel, endDistance)}
							onClick={onClick}
						>
							{startLabel}
						</EdgeLabel>
					)}
					{endLabel != null && (
						<EdgeLabel
							{...labelAt("end", endLabel, length - endDistance)}
							onClick={onClick}
						>
							{endLabel}
						</EdgeLabel>
					)}
				</EdgeLabelRenderer>
			)}
		</>
	);
};
