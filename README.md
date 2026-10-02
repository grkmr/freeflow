# FreeFlow

React Flow graphs that lay themselves out. FreeFlow positions your nodes and routes your edges with [ELK](https://eclipse.dev/elk/), and draws the edges with labels, markers and click handlers.

## Install

```bash
pnpm add @grkmr/freeflow react react-dom
```

Import the styles once, e.g. next to where you use FreeFlow. They include React Flow's styles:

```ts
import "@grkmr/freeflow/style.css";
```

The JavaScript itself imports no CSS, so it also works where packages aren't bundled, like Next.js server rendering, without `transpilePackages`.

## Usage

```tsx
import {
	type CircleNode,
	type EdgeType,
	FreeFlow,
	MarkerType,
	type RectangleNode,
} from "@grkmr/freeflow";
import "@grkmr/freeflow/style.css";
import { Handle, type NodeProps, Position } from "@xyflow/react";

type BoxNode = RectangleNode<{ label: string }, "box">;
type DotNode = CircleNode<{ label: string }, "dot">;

const Box = ({ data }: NodeProps<BoxNode>) => (
	<div className="box">
		{data.label}
		<Handle type="target" position={Position.Top} />
		<Handle type="source" position={Position.Bottom} />
	</div>
);

const Dot = ({ data }: NodeProps<DotNode>) => (
	<div className="dot">
		{data.label}
		<Handle type="target" position={Position.Top} />
		<Handle type="source" position={Position.Bottom} />
	</div>
);

const nodeTypes = { box: Box, dot: Dot };

const nodes: (BoxNode | DotNode)[] = [
	{ id: "a", type: "dot", position: { x: 0, y: 0 }, data: { label: "start", shape: "circle" } },
	{ id: "b", type: "box", position: { x: 0, y: 0 }, data: { label: "parse", shape: "rectangle" } },
];

const edges: EdgeType[] = [
	{
		id: "a-b",
		source: "a",
		target: "b",
		label: "raw",
		markerEnd: { type: MarkerType.ArrowClosed },
	},
];

export const App = () => (
	<div style={{ height: "100vh" }}>
		<FreeFlow defaultNodes={nodes} edges={edges} nodeTypes={nodeTypes} />
	</div>
);
```

Positions are set by the layout, so `{ x: 0, y: 0 }` is fine. Define `nodeTypes` and `layoutOptions` outside your component: a new object on every render starts a new layout.

## Nodes

Every node extends `RectangleNode` or `CircleNode` and says its shape in `data.shape` (`"rectangle"` or `"circle"`). Edges into circle nodes end on the circle instead of the bounding box.

Your node components need a target and a source `Handle`, otherwise React Flow doesn't draw their edges. FreeFlow hides the handles.

## Edges

| Field | Description |
| --- | --- |
| `id`, `source`, `target` | Like React Flow. Ids must be unique. |
| `label` | Label in the middle of the edge. |
| `startLabel`, `endLabel` | Labels at the source and target end. |
| `style` | SVG styles, e.g. `{ strokeWidth: 3 }` or `{ strokeDasharray: "6 4" }`. |
| `animated` | Moving dashes. |
| `markerStart`, `markerEnd` | `{ type: MarkerType.Arrow }`, `{ type: MarkerType.ArrowClosed }` or one of `EDGE_MARKERS.circle`, `.diamond`, `.bar`. |
| `onClick` | `(edge, event) => void`. Makes the line, its labels and an icon clickable. |
| `clickIcon` | Icon of clickable edges. An info icon by default, `null` hides it. |

Self-loops (`source === target`) are supported, also several on one node.

## Layout

Pass [ELK layout options](https://eclipse.dev/elk/reference/options.html) as `layoutOptions`. The default is a top-down layered layout with curved edges:

```tsx
const layoutOptions = {
	"elk.algorithm": "layered",
	"elk.direction": "RIGHT",
	"elk.edgeRouting": "ORTHOGONAL",
};

<FreeFlow layoutOptions={layoutOptions} defaultNodes={nodes} edges={edges} />;
```

`elk.edgeRouting` can be `SPLINES`, `ORTHOGONAL` or `POLYLINE`. The `layered` algorithm also places the labels and makes room for them.

All other React Flow props, like `onMoveStart` or `minZoom`, are passed through.

## Development

```bash
pnpm install
pnpm play        # playground
pnpm typecheck
pnpm build
```

## Release

```bash
pnpm release
```

Bumps the version, tags and pushes. The `Release` workflow then checks, builds and publishes to npm.
