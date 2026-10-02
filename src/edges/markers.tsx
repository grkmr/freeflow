const MARKER_COLOR = "var(--xy-edge-stroke, #b1b1b7)";

const markerId = (name: string) => `freeflow-marker-${name}`;

export const EDGE_MARKERS = {
	circle: markerId("circle"),
	diamond: markerId("diamond"),
	bar: markerId("bar"),
} as const;

export const EdgeMarkerDefinitions = () => (
	<svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
		<defs>
			<marker
				id={markerId("circle")}
				viewBox="0 0 10 10"
				refX={10}
				refY={5}
				markerWidth={9}
				markerHeight={9}
				orient="auto-start-reverse"
				markerUnits="userSpaceOnUse"
			>
				<circle cx={5} cy={5} r={5} fill={MARKER_COLOR} />
			</marker>
			<marker
				id={markerId("diamond")}
				viewBox="0 0 10 10"
				refX={10}
				refY={5}
				markerWidth={14}
				markerHeight={14}
				orient="auto-start-reverse"
				markerUnits="userSpaceOnUse"
			>
				<path d="M 0 5 L 5 1 L 10 5 L 5 9 Z" fill={MARKER_COLOR} />
			</marker>
			<marker
				id={markerId("bar")}
				viewBox="0 0 10 10"
				refX={10}
				refY={5}
				markerWidth={12}
				markerHeight={12}
				orient="auto-start-reverse"
				markerUnits="userSpaceOnUse"
			>
				<path d="M 9 0 L 9 10" stroke={MARKER_COLOR} strokeWidth={2} />
			</marker>
		</defs>
	</svg>
);
