import "./style.css";

const canvasContainer = document.querySelector<HTMLDivElement>("#canvas-container")!;
const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

interface GameConfig {
	column: number,
	keys: Array<string>,
	minHWRatio: number,
	accelY: number,
}

const config: GameConfig = {
	column: 4,
	keys: ["KeyD", "KeyF", "KeyJ", "KeyK"],
	minHWRatio: 2.0,
	accelY: 0.05,
};

const beatmap: Array<Array<boolean>> = [];

const updateSize = () => {
	const { clientHeight, clientWidth } = canvasContainer;
	const { column, minHWRatio } = config;
	canvas.height = clientHeight;
	if (clientHeight / clientWidth < minHWRatio) {
		canvas.width = Math.floor(canvas.height / minHWRatio);
	} else {
		canvas.width = clientWidth;
	}
	canvas.width -= canvas.width % column;
};

updateSize();
window.onresize = updateSize;

const generateBeatmap = () => {
	const res = new Array<boolean>(config.column);
	res[Math.floor(Math.random() * config.column)] = true;
	beatmap.push(res);
};

const getRow = (row: number) => {
	while (beatmap.length <= row) {
		generateBeatmap();
	}
	return beatmap[row];
};

let currentRow = 0;
let floatY = 0.0;
let velY = 0.0;

const redrawCanvas = () => {
	const { height, width } = canvas;
	const { column, accelY } = config;
	const ctx = canvas.getContext("2d")!;
	const blockSize = Math.floor(width / column);
	const row = Math.ceil(height / blockSize);

	ctx.clearRect(0, 0, width, height);


	if (floatY <= 0.0) {
		floatY = 0.0;
		velY = 0.0;
	} else {
		floatY -= velY;
		velY += accelY;
	}

	for (let i = 0; i < row; i++) {
		const r = getRow(i + currentRow);
		for (let j = 0; j < column; j++) {
			if (r[j]) {
				ctx.fillRect(j * blockSize, height - (i + 1) * blockSize - floatY * blockSize, blockSize, blockSize);
			}
		}
	}

	window.requestAnimationFrame(redrawCanvas);
};

redrawCanvas();

const handleKeys = (e: KeyboardEvent) => {
	const pressedColumn = config.keys.indexOf(e.code);
	if (pressedColumn == -1) return;

	const r = getRow(currentRow);
	if (r[pressedColumn]) {
		r[pressedColumn] = false;
		if (r.every((e) => !e)) {
			currentRow++;
			floatY = 1.0;
		}
	}
};

canvasContainer.onkeydown = handleKeys;
canvasContainer.focus();