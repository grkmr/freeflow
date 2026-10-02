export const DEFAULT_LAYOUT_OPTIONS = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.edgeRouting": "SPLINES",
	"elk.spacing.nodeNode": "40",
	"elk.spacing.edgeNode": "20",
	"elk.spacing.edgeEdge": "15",
	"elk.spacing.nodeSelfLoop": "20",
	"elk.layered.spacing.nodeNodeBetweenLayers": "60",
	"elk.layered.spacing.edgeNodeBetweenLayers": "20",
	"elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
	"elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
} as const satisfies Record<string, string>;
