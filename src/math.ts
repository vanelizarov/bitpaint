
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