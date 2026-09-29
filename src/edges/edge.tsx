import {
	BaseEdge,
	getBezierPath,
	type Edge,
	type EdgeProps,
} from "@xyflow/react";
import type { Position } from "../types/FreeFlow";
import { EDGE_PATH_BUILDERS, type EdgeRouting } from "./paths";

export type LayoutEdgeType = Edge<
	{
		startPoint: Position;
		endPoint: Position;
		bendPoints: Position[];
		routing: EdgeRouting;
	},
	"layout"
>;

const getEdgePath = ({
	startPoint,
	endPoint,
	bendPoints,
	routing,
}: NonNullable<LayoutEdgeType["data"]>) =>
	EDGE_PATH_BUILDERS[routing]([startPoint, ...bendPoints, endPoint]);

export const LayoutEdge = ({ data, ...props }: EdgeProps<LayoutEdgeType>) => {
	const edgePath = data ? getEdgePath(data) : getBezierPath(props)[0];

	return <BaseEdge {...props} path={edgePath} />;
};
