import type { Node } from "@xyflow/react";
import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import type { ReactNode } from "react";
import {
	type EdgeLabelKind,
	type EdgeRoute,
	hasClickIcon,
	type LayoutEdgeType,
} from "../../../edges/edge";
import { measureCenterLabel, measureLabel } from "../../../edges/labels";
import { isEdgeRouting } from "../../../edges/paths";

const elk = new ELK();

const LABEL_PLACEMENTS: Record<EdgeLabelKind, string> = {
	start: "TAIL",
	end: "HEAD",
	center: "CENTER",
};

const getLabels = (edge: LayoutEdgeType) => {
	const hasIcon = hasClickIcon(edge.data);
	const labels: [
		EdgeLabelKind,
		ReactNode,
		{ width: number; height: number },
	][] = [];

	if (edge.data?.startLabel != null) {
		labels.push([
			"start",
			edge.data.startLabel,
			measureLabel(edge.data.startLabel),
		]);
	}
	if (edge.data?.endLabel != null) {
		labels.push(["end", edge.data.endLabel, measureLabel(edge.data.endLabel)]);
	}
	if (edge.label != null || hasIcon) {
		labels.push([
			"center",
			edge.label,
			measureCenterLabel(edge.label, hasIcon),
		]);
	}
	return labels;
};

const labelId = (edgeId: string, kind: EdgeLabelKind) => `${edgeId}:${kind}`;

const placesLabels = (layoutOptions: Record<string, string>) =>
	["layered", "org.eclipse.elk.layered"].includes(
		layoutOptions["elk.algorithm"] ?? "layered",
	);

export const elkLayout = async (
	nodes: Node[],
	edges: LayoutEdgeType[],
	layoutOptions: Record<string, string> = {},
) => {
	const graph: ElkNode = {
		id: "root",
		layoutOptions,
		children: nodes.map(({ id, measured }) => ({
			id,
			width: measured?.width ?? 0,
			height: measured?.height ?? 0,
		})),
		edges: edges.map((edge) => ({
			id: edge.id,
			sources: [edge.source],
			targets: [edge.target],
			labels: getLabels(edge).map(([kind, label, size]) => ({
				id: labelId(edge.id, kind),
				text: typeof label === "string" ? label : kind,
				...size,
				layoutOptions: {
					"elk.edgeLabels.placement": LABEL_PLACEMENTS[kind],
					"elk.edgeLabels.inline": String(kind === "center"),
				},
			})),
		})),
	};
	const layoutResult = await elk.layout(graph);

	const edgeRouting = layoutOptions["elk.edgeRouting"];
	const routing = isEdgeRouting(edgeRouting) ? edgeRouting : "ORTHOGONAL";

	const positions = new Map(
		layoutResult.children?.map(({ id, x, y }) => [
			id,
			{ x: x ?? 0, y: y ?? 0 },
		]),
	);

	const sections = new Map(
		layoutResult.edges?.map(({ id, sections }) => [id, sections?.[0]]),
	);

	const labelPositions = new Map<string, EdgeRoute["labels"]>();
	if (placesLabels(layoutOptions)) {
		for (const edge of layoutResult.edges ?? []) {
			const placed: NonNullable<EdgeRoute["labels"]> = {};
			for (const kind of ["start", "end", "center"] as const) {
				const label = edge.labels?.find(
					({ id }) => id === labelId(edge.id, kind),
				);
				if (label?.x !== undefined && label.y !== undefined) {
					placed[kind] = {
						x: label.x + (label.width ?? 0) / 2,
						y: label.y + (label.height ?? 0) / 2,
					};
				}
			}
			labelPositions.set(edge.id, placed);
		}
	}

	return {
		nodes: nodes.map<Node>((node) => ({
			...node,
			position: positions.get(node.id) ?? node.position,
		})),

		edges: edges.map<LayoutEdgeType>((edge) => {
			const section = sections.get(edge.id);

			const { route: _previousRoute, ...data } = edge.data ?? {};

			return {
				...edge,
				type: "layout",
				data: section
					? {
							...data,
							route: {
								startPoint: section.startPoint,
								endPoint: section.endPoint,
								bendPoints: section.bendPoints ?? [],
								routing,
								labels: labelPositions.get(edge.id) ?? {},
							},
						}
					: data,
			};
		}),
	};
};
