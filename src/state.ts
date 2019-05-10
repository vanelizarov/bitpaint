class _State implements State {
	cols = 16
	rows = 16
	activeColor: string
	tileSize: number
}

export interface State {
	cols: number
	rows: number
	activeColor: string
	tileSize: number
}

export default new _State()