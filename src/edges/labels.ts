import type { ReactNode } from "react";

const LABEL_FONT = "10px system-ui, sans-serif";
const LABEL_HEIGHT = 15;
const LABEL_PADDING_X = 8;

const FALLBACK_SIZE = { width: 40, height: LABEL_HEIGHT };

const CLICK_ICON_SIZE = 12;
const ICON_GAP = 3;

let context: CanvasRenderingContext2D | null | undefined;

export const measureLabel = (label: ReactNode) => {
	if (typeof label !== "string" && typeof label !== "number") {
		return FALLBACK_SIZE;
	}
	const text = String(label);

	if (context === undefined) {
		context =
			typeof document === "undefined"
				? null
				: document.createElement("canvas").getContext("2d");
	}
	if (!context) {
		return { width: text.length * 6 + LABEL_PADDING_X, height: LABEL_HEIGHT };
	}

	context.font = LABEL_FONT;
	return {
		width: Math.ceil(context.measureText(text).width) + LABEL_PADDING_X,
		height: LABEL_HEIGHT,
	};
};

export const measureCenterLabel = (label: ReactNode, withIcon: boolean) => {
	if (label == null) {
		return {
			width: CLICK_ICON_SIZE + LABEL_PADDING_X,
			height: LABEL_HEIGHT,
		};
	}
	const size = measureLabel(label);
	return withIcon
		? { ...size, width: size.width + CLICK_ICON_SIZE + ICON_GAP }
		: size;
};
