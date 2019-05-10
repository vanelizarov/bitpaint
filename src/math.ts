export class Vec2d {
	x = 0
	y = 0

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	static copyWith(other: Vec2d): Vec2d {
		return new Vec2d(other.x, other.y)
	}

	static get zero(): Vec2d {
		return new Vec2d(0, 0)
	}
}

export function mapValue(value: number, low1: number, high1: number, low2: number, high2: number) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function calcTilesForLine(start: Vec2d, end: Vec2d): Vec2d[] {
	// based on Bressenham's line algorithm
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

	return tiles
}