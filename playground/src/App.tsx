import {
	type MouseEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FreeFlow } from "../../src";
import { GRAPHS, type PlaygroundEdge } from "./graphs";
import { NODE_TYPES } from "./nodes";

const BASE_OPTIONS = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.spacing.nodeNode": "40",
	"elk.spacing.nodeSelfLoop": "20",
	"elk.layered.spacing.nodeNodeBetweenLayers": "60",
};

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

const Select = ({
	value,
	options,
	onChange,
}: {
	value: string;
	options: string[];
	onChange: (value: string) => void;
}) => (
	<select value={value} onChange={(e) => onChange(e.target.value)}>
		{options.map((name) => (
			<option key={name} value={name}>
				{name}
			</option>
		))}
	</select>
);

type OpenEdge = { edge: PlaygroundEdge; x: number; y: number };

const getAnchor = (event: MouseEvent<Element>) => {
	if (event.detail > 0) return { x: event.clientX, y: event.clientY };
	const rect = event.currentTarget.getBoundingClientRect();
	return { x: rect.right, y: rect.bottom };
};

const POPOVER_OFFSET = 10;

const EdgePopover = ({
	open: { edge, x, y },
	onClose,
}: {
	open: OpenEdge;
	onClose: () => void;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ left: x, top: y });

	useLayoutEffect(() => {
		const { width, height } = ref.current?.getBoundingClientRect() ?? {
			width: 0,
			height: 0,
		};
		const fitsRight = x + POPOVER_OFFSET + width < window.innerWidth;
		const fitsBelow = y + POPOVER_OFFSET + height < window.innerHeight;
		setPosition({
			left: fitsRight ? x + POPOVER_OFFSET : x - POPOVER_OFFSET - width,
			top: fitsBelow ? y + POPOVER_OFFSET : y - POPOVER_OFFSET - height,
		});
		ref.current?.focus();
	}, [x, y]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [onClose]);

	return (
		<div
			ref={ref}
			className="edge-popover"
			role="dialog"
			aria-label={`${edge.source} to ${edge.target}`}
			tabIndex={-1}
			style={position}
		>
			<h2>
				{edge.source} → {edge.target}
			</h2>
			<p>{edge.description}</p>
		</div>
	);
};

export function App() {
	const [graph, setGraph] = useState(Object.keys(GRAPHS)[0] ?? "");
	const [preset, setPreset] = useState(Object.keys(LAYOUT_PRESETS)[0] ?? "");

	const [openEdge, setOpenEdge] = useState<OpenEdge>();
	const closePopover = useCallback(() => setOpenEdge(undefined), []);

	const { nodes, edges: graphEdges } = GRAPHS[graph] ?? {
		nodes: [],
		edges: [],
	};
	const edges = useMemo(
		() =>
			graphEdges.map((edge) =>
				edge.description
					? {
							...edge,
							onClick: (_: unknown, event: MouseEvent<Element>) =>
								setOpenEdge({ edge, ...getAnchor(event) }),
						}
					: edge,
			),
		[graphEdges],
	);

	return (
		<div style={{ height: "100vh", width: "100%", position: "relative" }}>
			<div
				style={{
					position: "absolute",
					top: 12,
					left: 12,
					zIndex: 10,
					display: "flex",
					gap: 8,
				}}
			>
				<Select
					value={graph}
					options={Object.keys(GRAPHS)}
					onChange={setGraph}
				/>
				<Select
					value={preset}
					options={Object.keys(LAYOUT_PRESETS)}
					onChange={setPreset}
				/>
			</div>
			<FreeFlow
				key={graph}
				nodes={nodes}
				nodeTypes={NODE_TYPES}
				edges={edges}
				layoutOptions={LAYOUT_PRESETS[preset]}
				onMoveStart={closePopover}
			/>
			{openEdge && <EdgePopover open={openEdge} onClose={closePopover} />}
		</div>
	);
}
