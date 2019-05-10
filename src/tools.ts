import { Vec2d, calcTilesForLine } from './math.js'
import { paintTile, getRelativePointerPosition, getTileToDraw } from './drawing.js'
import { State } from './state.js'

export interface Tool {
	activate()
	suspend()
}

export class Pencil implements Tool {
	private _state: State
	private _cnv: HTMLCanvasElement
	private _ctx: CanvasRenderingContext2D
	private _isDrawing = false

	private _onMouseDown = event => {
		this._isDrawing = true
		this._drawWithEvent(event)
	}

	private _onMouseUp = _ => this._isDrawing = false

	private _onMouseMove = event => {
		if (this._isDrawing) {
			this._drawWithEvent(event)
		}
	}

	private _drawWithEvent = (event: MouseEvent) => {
		const bounds = this._cnv.getBoundingClientRect()
		const pos = getRelativePointerPosition(event, bounds)
		const tile = getTileToDraw({
			pos,
			bounds,
			cols: this._state.cols,
			rows: this._state.rows
		})

		paintTile({ ctx: this._ctx, tile, tileSize: this._state.tileSize })
	}

	constructor(cnv: HTMLCanvasElement, state: State) {
		this._cnv = cnv
		this._ctx = cnv.getContext('2d')
		this._state = state
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

export class Liner implements Tool {
	private _state: State
	private _cnv: HTMLCanvasElement
	private _ctx: CanvasRenderingContext2D

	private _overlay: HTMLCanvasElement
	private _octx: CanvasRenderingContext2D

	private _req: number = null
	private _isMoving = false

	private _v1: Vec2d = null
	private _tiles: Vec2d[] = []

	private _draw = () => {
		this._clear()

		this._octx.fillStyle = this._state.activeColor
		for (const tile of this._tiles) {
			paintTile({ ctx: this._octx, tile, tileSize: this._state.tileSize })
		}

		this._req = window.requestAnimationFrame(this._draw)
	}

	private _clear = () => {
		this._octx.clearRect(0, 0, this._overlay.width, this._overlay.height)
	}

	private _onMouseDown = event => {
		this._overlay.style.transform = this._cnv.style.transform

		if (!this._isMoving) {
			this._isMoving = true

			const bounds = this._cnv.getBoundingClientRect()
			const pos = getRelativePointerPosition(event, bounds)
			this._v1 = getTileToDraw({ pos, bounds, cols: this._state.cols, rows: this._state.rows })

			this._tiles = [this._v1]
			this._req = window.requestAnimationFrame(this._draw)
		} else {
			this._isMoving = false

			const bounds = this._cnv.getBoundingClientRect()
			const pos = getRelativePointerPosition(event, bounds)
			const v2 = getTileToDraw({ pos, bounds, cols: this._state.cols, rows: this._state.rows })
			const tiles = calcTilesForLine(this._v1, v2)

			this._tiles = []
			this._v1 = null
			window.cancelAnimationFrame(this._req)
			this._req = null
			this._clear()

			for (const tile of tiles) {
				paintTile({ ctx: this._ctx, tile, tileSize: this._state.tileSize })
			}
		}
	}

	// private _onMouseUp = _ => {

	// }

	private _onMouseMove = event => {
		if (this._isMoving) {
			const bounds = this._cnv.getBoundingClientRect()
			const pos = getRelativePointerPosition(event, bounds)
			const v2 = getTileToDraw({ pos, bounds, cols: this._state.cols, rows: this._state.rows })

			this._tiles = calcTilesForLine(this._v1, v2)
		}
	}

	constructor(cnv: HTMLCanvasElement, state: State) {
		this._cnv = cnv
		this._ctx = cnv.getContext('2d')

		this._state = state

		this._overlay = document.createElement('canvas')
		this._octx = this._overlay.getContext('2d')
		this._overlay.width = cnv.width
		this._overlay.height = cnv.height
		this._overlay.className = 'cnv cnv_overlay'
		this._overlay.style.zIndex = '3'
		this._overlay.style.transform = cnv.style.transform
	}

	activate() {
		this._overlay.style.transform = this._cnv.style.transform
		this._cnv.parentNode.appendChild(this._overlay)

		this._overlay.addEventListener('mousedown', this._onMouseDown)
		document.addEventListener('mousemove', this._onMouseMove)
	}

	suspend() {
		this._isMoving = false
		this._tiles = []
		this._v1 = null
		window.cancelAnimationFrame(this._req)
		this._req = null
		this._clear()
		this._cnv.parentNode.removeChild(this._overlay)

		this._overlay.removeEventListener('mousedown', this._onMouseDown)
		document.removeEventListener('mousemove', this._onMouseMove)
	}
}