import { getColors } from './colors.js'
import { getColorPicker, createColorNode, getCanvas, getWorkspace, createGrid } from './dom.js'
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
let isDrawing = false

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

function drawWithEvent(event: MouseEvent) {
	const bounds = cnv.getBoundingClientRect()
	const pos = getRelativePointerPosition(event, bounds)
	const tile = getTileToDraw(pos, bounds)

	paintTile(tile)
}

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


	cnv.addEventListener('mousedown', event => {
		isDrawing = true
		drawWithEvent(event)
	})
	document.addEventListener('mouseup', _ => isDrawing = false)
	document.addEventListener('mousemove', event => {
		if (!isDrawing) {
			return
		}
		drawWithEvent(event)
	})
}

main()