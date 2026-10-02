import { EDGE_MARKERS, type EdgeType, MarkerType } from "../../src";
import type { RectangleNode, RoundNode } from "./nodes";

const WarningIcon = () => (
	<svg viewBox="0 0 12 12" aria-hidden="true">
		<path d="M6 0.8 L11.5 10.8 H0.5 Z" fill="#f59e0b" />
		<rect x="5.3" y="4" width="1.4" height="3.8" rx="0.5" fill="#ffffff" />
		<circle cx="6" cy="9.1" r="0.8" fill="#ffffff" />
	</svg>
);

export type PlaygroundEdge = EdgeType & { description?: string };

type Graph = { nodes: (RoundNode | RectangleNode)[]; edges: PlaygroundEdge[] };

type Connection = [string, string, Partial<PlaygroundEdge>?];

const ASYNC: Partial<EdgeType> = {
	style: { strokeDasharray: "6 4" },
	markerEnd: EDGE_MARKERS.circle,
};
const DATABASE: Partial<EdgeType> = {
	style: { strokeWidth: 3 },
	markerEnd: EDGE_MARKERS.diamond,
};
const CYCLE: Partial<EdgeType> = {
	animated: true,
	style: { stroke: "#e11d48", strokeWidth: 2 },
	markerStart: EDGE_MARKERS.bar,
	markerEnd: { type: MarkerType.ArrowClosed, color: "#e11d48" },
};

const createGraph = (
	connections: Connection[],
	roundIds: string[] = [],
): Graph => {
	const ids = [
		...new Set(
			connections.flatMap((connection) => connection.slice(0, 2) as string[]),
		),
	];

	return {
		nodes: ids.map((id, index) => {
			const position = { x: 0, y: index * 80 };

			return roundIds.includes(id)
				? { id, type: "round", position, data: { label: id, shape: "circle" } }
				: {
						id,
						type: "rectangle",
						position,
						data: { label: id, shape: "rectangle" },
					};
		}),
		edges: connections.map(([source, target, props], index) => ({
			markerEnd: { type: MarkerType.ArrowClosed },
			...props,
			id: `${source}-${target}-${index}`,
			source,
			target,
		})),
	};
};

const pipeline = createGraph(
	[
		[
			"fetch",
			"parse",
			{
				label: "raw",
				description: "Raw bytes of the HTTP response, unparsed.",
			},
		],
		["fetch", "cache", { description: "Responses are cached for 5 minutes." }],
		["fetch", "log"],
		["parse", "validate"],
		["parse", "enrich"],
		["cache", "enrich"],
		["cache", "store"],
		["validate", "transform"],
		[
			"validate",
			"log",
			{
				startLabel: "on error",
				description: "Invalid records are logged and skipped.",
				clickIcon: <WarningIcon />,
			},
		],
		["enrich", "transform"],
		["transform", "store", { label: "rows", startLabel: "1", endLabel: "n" }],
		["transform", "notify"],
		["store", "notify"],
	],
	["fetch", "log", "notify"],
);

const shop = createGraph(
	[
		["web", "gateway"],
		["mobile", "gateway"],
		["gateway", "auth", { endLabel: "JWT" }],
		["gateway", "catalog"],
		["gateway", "cart"],
		["gateway", "search"],
		["gateway", "metrics", ASYNC],
		["auth", "users"],
		["auth", "sessions"],
		["sessions", "redis", DATABASE],
		["catalog", "products"],
		["catalog", "pricing"],
		["catalog", "images"],
		["search", "indexer"],
		["search", "products"],
		["indexer", "products"],
		["products", "postgres", DATABASE],
		["pricing", "products"],
		["pricing", "redis", DATABASE],
		["images", "cdn"],
		["cart", "pricing"],
		[
			"cart",
			"checkout",
			{ label: "submit", startLabel: "1", endLabel: "0..1" },
		],
		["cart", "redis", DATABASE],
		[
			"checkout",
			"payment",
			{
				label: "pay",
				description: "Charges the card via the payment service.",
			},
		],
		["checkout", "inventory"],
		["checkout", "orders"],
		["payment", "fraud"],
		["payment", "provider", CYCLE],
		["provider", "payment", CYCLE],
		["fraud", "users"],
		["inventory", "products"],
		["inventory", "warehouse"],
		["orders", "postgres", DATABASE],
		[
			"orders",
			"queue",
			{
				...ASYNC,
				label: "publish",
				description: "An OrderCreated event is published to the queue.",
			},
		],
		["queue", "queue", CYCLE],
		["checkout", "checkout"],
		["checkout", "checkout", ASYNC],
		["checkout", "checkout", DATABASE],
		["queue", "email", ASYNC],
		["queue", "shipping", ASYNC],
		["queue", "analytics", ASYNC],
		["shipping", "warehouse"],
		["email", "users"],
		["users", "postgres", { ...DATABASE, startLabel: "1", endLabel: "*" }],
		["metrics", "analytics", ASYNC],
		["checkout", "metrics", ASYNC],
		["analytics", "warehouse"],
	],
	["web", "mobile", "postgres", "redis", "queue", "cdn", "warehouse"],
);

const createRandom = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const generateGraph = (layerCount: number, maxWidth: number, seed: number) => {
	const random = createRandom(seed);
	const pick = <T,>(items: T[]) =>
		items[Math.floor(random() * items.length)] as T;

	const layers: string[][] = [];
	for (let l = 0; l < layerCount; l++) {
		const width = 1 + Math.floor(random() * maxWidth);
		layers.push(Array.from({ length: width }, (_, i) => `n${l}-${i}`));
	}

	const connections = new Map<string, [string, string]>();
	const connect = (source: string, target: string) => {
		if (source !== target)
			connections.set(`${source}-${target}`, [source, target]);
	};

	layers.forEach((layer, l) => {
		if (l === 0) return;
		for (const node of layer) {
			const skip = random() < 0.8 ? 1 : 2 + Math.floor(random() * 3);
			connect(pick(layers[Math.max(0, l - skip)] as string[]), node);
			if (random() < 0.35) connect(pick(layers[l - 1] as string[]), node);
		}
	});

	for (let i = 0; i < layerCount / 4; i++) {
		const from = 2 + Math.floor(random() * (layerCount - 2));
		const to = Math.floor(random() * from);
		connect(pick(layers[from] as string[]), pick(layers[to] as string[]));
	}

	const all = layers.flat();
	const roundIds = all.filter(() => random() < 0.15);

	return createGraph([...connections.values()], roundIds);
};

const large = generateGraph(14, 10, 1);
const huge = generateGraph(24, 16, 7);

const describe = (name: string, graph: Graph) =>
	`${name} (${graph.nodes.length} nodes, ${graph.edges.length} edges)`;

export const GRAPHS: Record<string, Graph> = {
	[describe("Pipeline", pipeline)]: pipeline,
	[describe("Shop", shop)]: shop,
	[describe("Generated large", large)]: large,
	[describe("Generated huge", huge)]: huge,
};
