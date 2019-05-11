import { State } from './state.js'
import { SVG_NS } from './constants.js'

export type ImageType = 'image/jpeg' | 'image/png'

function triggerBlobDownlaod(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.download = filename
	a.href = url
	a.target = '_blank'
	a.click()
	URL.revokeObjectURL(url)
}

function cnvToBlob(cnv: HTMLCanvasElement, type: string): Promise<Blob> {
	return new Promise<Blob>(resolve => cnv.toBlob(resolve, type, 95))
}

export async function exportAsImage(state: State, type: ImageType, scale = 32) {

	const cnv = document.createElement('canvas')
	cnv.width = state.cols * scale
	cnv.height = state.rows * scale

	const ctx = cnv.getContext('2d')

	if (type === 'image/jpeg') {
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, cnv.width, cnv.height)
	}

	for (const tile of state.tiles) {
		ctx.fillStyle = tile.color
		ctx.fillRect(tile.pos.x * scale, tile.pos.y * scale, scale, scale)
	}

	const blob = await cnvToBlob(cnv, type)

	const ext = type === 'image/jpeg' ? 'jpg' : 'png'
	triggerBlobDownlaod(blob, `bitpaint-${Date.now()}.${ext}`)
}

// TODO: add ability to export as path
// TODO: reduce count of rect elements by merging siblings of same color
export function exportAsSvg(state: State, scale = 32) {
	const svg = document.createElementNS(SVG_NS, 'svg')
	svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
	svg.setAttribute('version', '1.1')
	svg.setAttribute('viewBox', `0 0 ${state.cols * scale} ${state.rows * scale}`)

	// TODO: filter tiles that are not in the viewbox
	for (const tile of state.tiles) {
		const rect = document.createElementNS(SVG_NS, 'rect')
		rect.setAttribute('x', `${tile.pos.x * scale}`)
		rect.setAttribute('y', `${tile.pos.y * scale}`)
		rect.setAttribute('width', scale.toString())
		rect.setAttribute('height', scale.toString())
		rect.setAttribute('fill', tile.color.toString())
		rect.setAttribute('stroke', 'none')

		svg.appendChild(rect)
	}

	const serializer = new XMLSerializer()
	const svgStr = serializer.serializeToString(svg)

	const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })

	triggerBlobDownlaod(blob, `bitpaint-${Date.now()}.svg`)
}