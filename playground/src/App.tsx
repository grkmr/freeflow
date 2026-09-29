import { useState } from "react";
import { type Edge, FreeFlow } from "../../src";

const nodeIds = [
	"fetch",
	"parse",
	"cache",
	"validate",
	"enrich",
	"transform",
	"log",
	"store",
	"notify",
];

const initialNodes = nodeIds.map((id, index) => ({
	id,
	label: id,
	type: "rectangle" as const,
	position: { x: (index % 3) * 150, y: Math.floor(index / 3) * 100 },
	data: {},
}));

const connections: [string, string][] = [
	["fetch", "parse"],
	["fetch", "cache"],
	["fetch", "log"],
	["parse", "validate"],
	["parse", "enrich"],
	["cache", "enrich"],
	["cache", "store"],
	["validate", "transform"],
	["validate", "log"],
	["enrich", "transform"],
	["transform", "store"],
	["transform", "notify"],
	["store", "notify"],
];

const initialEdges: Edge[] = connections.map(([source, target]) => ({
	id: `${source}-${target}`,
	source,
	target,
}));

const BASE_OPTIONS = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.spacing.nodeNode": "40",
	"elk.layered.spacing.nodeNodeBetweenLayers": "60",
};

// Defined outside the component so each preset keeps a stable identity.
const LAYOUT_PRESETS: Record<string, Record<string, string>> = {
	"Splines (down)": { ...BASE_OPTIONS, "elk.edgeRouting": "SPLINES" },
	"Orthogonal (down)": { ...BASE_OPTIONS, "elk.edgeRouting": "ORTHOGONAL" },
	"Polyline (down)": { ...BASE_OPTIONS, "elk.edgeRouting": "POLYLINE" },
	"Splines (right)": {
		...BASE_OPTIONS,
		"elk.direction": "RIGHT",
		"elk.edgeRouting": "SPLINES",
	},
	"Orthogonal (right)": {
		...BASE_OPTIONS,
		"elk.direction": "RIGHT",
		"elk.edgeRouting": "ORTHOGONAL",
	},
	"Force (straight)": { "elk.algorithm": "force" },
	"Tree (mrtree)": { "elk.algorithm": "mrtree" },
};

export function App() {
	const [preset, setPreset] = useState(Object.keys(LAYOUT_PRESETS)[0] ?? "");

	return (
		<div style={{ height: "100vh", width: "100vw", position: "relative" }}>
			<select
				value={preset}
				onChange={(e) => setPreset(e.target.value)}
				style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}
			>
				{Object.keys(LAYOUT_PRESETS).map((name) => (
					<option key={name} value={name}>
						{name}
					</option>
				))}
			</select>
			<FreeFlow
				nodes={initialNodes}
				edges={initialEdges}
				layoutOptions={LAYOUT_PRESETS[preset]}
			/>
		</div>
	);
}
