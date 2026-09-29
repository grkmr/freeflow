import type { Node, NodeProps } from "@xyflow/react";

export type RectangleNode = Node<{}, "rectangle">;

export const RectangleNode = ({}: NodeProps<RectangleNode>) => {
	return <div> test</div>;
};
