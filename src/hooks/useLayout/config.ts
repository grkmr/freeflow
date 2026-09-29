/**
 * Layered (Sugiyama) layout with spline (curved) edge routing.
 * Keys are ELK option ids, see https://eclipse.dev/elk/reference/options.html
 */
export const DEFAULT_LAYOUT_OPTIONS = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.edgeRouting": "SPLINES",
	"elk.spacing.nodeNode": "40",
	"elk.spacing.edgeNode": "20",
	"elk.spacing.edgeEdge": "15",
	"elk.layered.spacing.nodeNodeBetweenLayers": "60",
	"elk.layered.spacing.edgeNodeBetweenLayers": "20",
	"elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
	"elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
} as const satisfies Record<string, string>;
