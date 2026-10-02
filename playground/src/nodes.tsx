import {
	Handle,
	type NodeProps,
	type NodeTypes,
	Position,
} from "@xyflow/react";
import type { CircleNode, RectangleNode as RectangleBase } from "../../src";

type LabelData = { label: string };

export type RoundNode = CircleNode<LabelData, "round">;
export type RectangleNode = RectangleBase<LabelData, "rectangle">;

const Handles = () => (
	<>
		<Handle type="target" position={Position.Top} />
		<Handle type="source" position={Position.Bottom} />
	</>
);

export const RoundNode = ({ data }: NodeProps<RoundNode>) => (
	<div className="node node-round">
		{data.label}
		<Handles />
	</div>
);

export const RectangleNode = ({ data }: NodeProps<RectangleNode>) => (
	<div className="node node-rectangle">
		{data.label}
		<Handles />
	</div>
);

export const NODE_TYPES = {
	round: RoundNode,
	rectangle: RectangleNode,
} as const satisfies NodeTypes;
