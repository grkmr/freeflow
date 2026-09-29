import { type Edge, FreeFlow } from "../../src";

const initialNodes = [
	{
		id: "n1",
		type: "rectangle" as const,
		position: { x: 0, y: 0 },
		data: {},
	},
	{
		id: "n2",
		type: "rectangle" as const,
		position: { x: 100, y: 100 },
		data: {},
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
