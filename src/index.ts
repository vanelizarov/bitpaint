import { getColors } from './colors.js'
import { getColorPicker, createColorNode, getCanvas, getWorkspace, createGrid, getDrawingTools } from './dom.js'
import { Vec2d, mapValue } from './math.js'

const workspace = getWorkspace()
const META_KEY = 'Meta'
const CTRL_KEY = 'Control'
const MIN_SCALE = 0.3
const MAX_SCALE = 6.0
let ctrlPressed = false
let currentScale = 1

function scaleCanvas(scale: number) {
	const t = `translate3d(-50%, -50%, 0) scale(${scale})`
	cnv.style.transform = t
	grid.style.transform = t
}

const cnv = getCanvas()
const cols = 16
const rows = 16
const grid = createGrid(cnv, cols, rows)
const tileSize = cnv.width / cols

const ctx = cnv.getContext('2d')
const ACTIVE_COLOR_CLASSNAME = 'color_active'
const colorPicker = getColorPicker()
let activeColorNode: HTMLElement
let activeColor: string

function getRelativePointerPosition(event: MouseEvent, bounds: ClientRect): Vec2d {
	const mouse = new Vec2d(event.clientX, event.clientY)
	const pos = new Vec2d(mouse.x - bounds.left, mouse.y - bounds.top)
	return pos
}

// returns vector that contains INDICIES, not x,y coords
function getTileToDraw(pos: Vec2d, bounds: ClientRect): Vec2d {
	return new Vec2d(
		Math.floor(mapValue(pos.x, 0, bounds.width, 0, cols)),
		Math.floor(mapValue(pos.y, 0, bounds.height, 0, rows))
	)
}

function paintTile(tile: Vec2d) {
	ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize)
}

function paintLine(start: Vec2d, end: Vec2d) {
	// based on Bressenham's algorithm
	const tiles: Vec2d[] = []

	let x1 = start.x
	let y1 = start.y
	const x2 = end.x
	const y2 = end.y

	const dx = Math.abs(x2 - x1)
	const dy = Math.abs(y2 - y1)
	const sx = x1 < x2 ? 1 : -1
	const sy = y1 < y2 ? 1 : -1

	let err1 = dx - dy

	tiles.push(new Vec2d(x1, y1))

	while (!(x1 === x2 && y1 === y2)) {
		const err2 = err1 << 1

		if (err2 > -dy) {
			err1 -= dy
			x1 += sx
		}
		if (err2 < dx) {
			err1 += dx
			y1 += sy
		}

		tiles.push(new Vec2d(x1, y1))
	}

	for (const tile of tiles) {
		paintTile(tile)
	}
}

function drawWithEvent(event: MouseEvent) {
	const bounds = cnv.getBoundingClientRect()
	const pos = getRelativePointerPosition(event, bounds)
	const tile = getTileToDraw(pos, bounds)

	paintTile(tile)
}

interface Tool {
	activate()
	suspend()
}

class Pencil implements Tool {
	private _cnv: HTMLCanvasElement
	private _isDrawing = false

	private _onMouseDown = event => {
		this._isDrawing = true
		drawWithEvent(event)
	}

	private _onMouseUp = _ => this._isDrawing = false

	private _onMouseMove = event => {
		if (this._isDrawing) {
			drawWithEvent(event)
		}
	}

	constructor(cnv: HTMLCanvasElement) {
		this._cnv = cnv
	}

	activate() {
		this.suspend()
		this._cnv.addEventListener('mousedown', this._onMouseDown)
		document.addEventListener('mouseup', this._onMouseUp)
		document.addEventListener('mousemove', this._onMouseMove)
	}

	suspend() {
		this._cnv.removeEventListener('mousedown', this._onMouseDown)
		document.removeEventListener('mouseup', this._onMouseUp)
		document.removeEventListener('mousemove', this._onMouseMove)
	}
}

class Liner implements Tool {
	private _cnv: HTMLCanvasElement

	private _isDrawing = false

	private _onMouseDown = event => {
		this._isDrawing = true
		drawWithEvent(event)
	}

	private _onMouseUp = _ => this._isDrawing = false

	private _onMouseMove = event => {
		if (this._isDrawing) {
			drawWithEvent(event)
		}
	}

	constructor(cnv: HTMLCanvasElement) {
		this._cnv = cnv
	}

	activate() {
		// let lineStart: Vec2d = null
		// let lineEnd: Vec2d = null

		// cnv.addEventListener('mousedown', event => {
		// 	if (lineStart === null) {
		// 		const bounds = cnv.getBoundingClientRect()
		// 		const pos = getRelativePointerPosition(event, bounds)
		// 		const tile = getTileToDraw(pos, bounds)
		// 		lineStart = tile
		// 		return
		// 	}
		// 	const bounds = cnv.getBoundingClientRect()
		// 	const pos = getRelativePointerPosition(event, bounds)
		// 	const tile = getTileToDraw(pos, bounds)
		// 	lineEnd = tile

		// 	paintLine(lineStart, lineEnd)
		// 	lineStart = null
		// 	lineEnd = null

		// isDrawing = true
		// drawWithEvent(event)
		//})
		// document.addEventListener('mouseup', _ => isDrawing = false)
		// document.addEventListener('mousemove', event => {
		// 	if (!isDrawing) {
		// 		return
		// 	}
		// 	drawWithEvent(event)
		// })
	}

	suspend() {
	}
}

const ACTIVE_DRAWING_TOOL_CLASSNAME = 'tool_active'
const tools = new Map<string, Tool>([
	['pencil', new Pencil(cnv)],
	['liner', new Liner(cnv)]
])
const drawingTools = getDrawingTools()
let activeTool = tools.get('pencil')
let activeDrawingTool: HTMLButtonElement

async function main() {
	const colors = await getColors()

	for (const color of colors) {
		const colorNode = createColorNode(color)
		colorPicker.appendChild(colorNode)
	}

	activeColorNode = colorPicker.children[0] as HTMLElement
	activeColorNode.classList.add(ACTIVE_COLOR_CLASSNAME)
	activeColor = activeColorNode.dataset.color

	colorPicker.addEventListener('click', event => {
		const colorNode = event.target as HTMLElement
		const colorHex = colorNode.dataset.color

		activeColorNode.classList.remove(ACTIVE_COLOR_CLASSNAME)
		activeColorNode = colorNode
		activeColorNode.classList.add(ACTIVE_COLOR_CLASSNAME)
		activeColor = colorHex
		ctx.fillStyle = activeColor
	})



	window.addEventListener('keydown', event => {
		if (event.key === CTRL_KEY || event.key === META_KEY) {
			ctrlPressed = true
		}
	})
	window.addEventListener('keyup', event => {
		if (event.key === CTRL_KEY || event.key === META_KEY) {
			ctrlPressed = false
		}
	})
	workspace.addEventListener('wheel', event => {
		if (ctrlPressed) {
			const step = event.deltaY < 0 ? 0.01 : -0.01
			if (currentScale + step < MIN_SCALE || currentScale + step > MAX_SCALE) {
				return
			}
			currentScale += step
			scaleCanvas(currentScale)
		}
	})
	workspace.insertBefore(grid, cnv)



	activeDrawingTool = drawingTools.children[0] as HTMLButtonElement
	activeDrawingTool.classList.add(ACTIVE_DRAWING_TOOL_CLASSNAME)
	activeTool.activate()

	drawingTools.addEventListener('click', event => {
		tools.forEach(tool => tool.suspend())

		const colorNode = event.target as HTMLButtonElement
		const id = colorNode.dataset.toolId

		activeTool = tools.get(id)
		activeTool.activate()
		activeDrawingTool.classList.remove(ACTIVE_DRAWING_TOOL_CLASSNAME)
		activeDrawingTool = colorNode
		activeDrawingTool.classList.add(ACTIVE_DRAWING_TOOL_CLASSNAME)
	})
}

main()