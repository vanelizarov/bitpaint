import { Color } from './colors.js'

function $(selector: string): HTMLElement {
	return document.querySelector(selector)
}

export function getToolbar(): HTMLDivElement {
	return $('.toolbar') as HTMLDivElement
}

export function getColorPicker(): HTMLDivElement {
	return $('.toolbar .color-picker') as HTMLDivElement
}

export function getWorkspace(): HTMLDivElement {
	return $('.workspace') as HTMLDivElement
}

export function getCanvas(): HTMLCanvasElement {
	return $('.workspace .cnv') as HTMLCanvasElement
}

export function getDrawingTools(): HTMLDivElement {
	return $('.drawing-tools') as HTMLDivElement
}

export function createColorNode(color: Color): HTMLDivElement {
	const node = document.createElement('div')
	node.className = 'color'
	node.style.backgroundColor = color.hexString
	node.title = color.name
	node.setAttribute('data-color', color.hexString)
	node.setAttribute('data-color-id', color.colorId.toString())

	return node
}

export function createGrid(cnv: HTMLCanvasElement, cols: number, rows: number): HTMLCanvasElement {
	const grid = document.createElement('canvas')
	grid.width = cnv.width
	grid.height = cnv.height
	grid.className = 'cnv cnv_grid'
	grid.style.zIndex = '1'

	const ctx = grid.getContext('2d')
	ctx.fillStyle = '#fff'
	ctx.fillRect(0, 0, grid.width, grid.height)

	const scale = grid.width / cols
	ctx.fillStyle = 'rgba(0, 0, 0, .3)'

	for (let i = 1; i < rows; i++) {
		ctx.fillRect(0, i * scale, grid.width, 1)
	}

	for (let j = 1; j < cols; j++) {
		ctx.fillRect(j * scale, 0, 1, grid.height)
	}

	return grid
}