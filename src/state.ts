import { Vec2d } from './math.js'

class _State implements State {
	cols = 16
	rows = 16
	activeColor: string
	tileSize: number
	tiles: Tile[] = []
}

export interface Tile {
	pos: Vec2d
	color: string
}

export interface State {
	cols: number
	rows: number
	activeColor: string
	tileSize: number
	tiles: Tile[]
}

export default new _State()