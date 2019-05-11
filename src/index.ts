import { getColors } from './colors.js'

import {
	getColorPicker,
	createColorNode,
	getCanvas,
	getWorkspace,
	createGrid,
	getDrawingTools
} from './dom.js'

import {
	ACTIVE_COLOR_CLASSNAME,
	META_KEY,
	CTRL_KEY,
	MIN_SCALE,
	MAX_SCALE,
	ACTIVE_DRAWING_TOOL_CLASSNAME
} from './constants.js'

import { Tool, Pencil, Liner } from './tools.js'

import { exportAsImage, exportAsSvg } from './io.js'

import state from './state.js'

const workspace = getWorkspace()

let ctrlPressed = false
let currentScale = 1

function scaleCanvas(scale: number) {
	const t = `translate3d(-50%, -50%, 0) scale(${scale})`
	cnv.style.transform = t
	grid.style.transform = t
}

const cnv = getCanvas()
state.cols = 16
state.rows = 16
const grid = createGrid(cnv, state.cols, state.rows)
state.tileSize = cnv.width / state.cols

const ctx = cnv.getContext('2d')
const colorPicker = getColorPicker()
let activeColorNode: HTMLElement

const tools = new Map<string, Tool>([
	['pencil', new Pencil(cnv)],
	['liner', new Liner(cnv)]
])
const drawingTools = getDrawingTools()
let activeTool = tools.get('pencil')
let activeDrawingTool: HTMLButtonElement

window['exp'] = function () {
	exportAsSvg(state)
	exportAsImage(state, 'image/png')
	exportAsImage(state, 'image/jpeg')
}

async function main() {
	const colors = await getColors()

	for (const color of colors) {
		const colorNode = createColorNode(color)
		colorPicker.appendChild(colorNode)
	}

	activeColorNode = colorPicker.children[0] as HTMLElement
	activeColorNode.classList.add(ACTIVE_COLOR_CLASSNAME)
	state.activeColor = activeColorNode.dataset.color

	colorPicker.addEventListener('click', event => {
		const colorNode = event.target as HTMLElement
		const colorHex = colorNode.dataset.color

		activeColorNode.classList.remove(ACTIVE_COLOR_CLASSNAME)
		activeColorNode = colorNode
		activeColorNode.classList.add(ACTIVE_COLOR_CLASSNAME)
		state.activeColor = colorHex
		ctx.fillStyle = state.activeColor
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
		activeTool.suspend()

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