import { Edge, FreeFlow, Node } from "../../src";

const initialNodes: Node[] = [
	{
		id: "n1",
		position: { x: 0, y: 0 },
		data: { label: "Node 1" },
	},
	{
		id: "n2",
		position: { x: 100, y: 100 },
		data: { label: "Node 2" },
	},
];
const initialEdges: Edge[] = [
	{
		id: "n1-n2",
		source: "n1",
		target: "n2",
	},
];

export function App() {
	return (
		<div style={{ height: "100vh", width: "100vw" }}>
			<FreeFlow nodes={initialNodes} edges={initialEdges} />
		</div>
	);
}
