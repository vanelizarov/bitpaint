import { Vec2d, mapValue } from './math.js'

export function getRelativePointerPosition(event: MouseEvent, bounds: ClientRect): Vec2d {
	const mouse = new Vec2d(event.clientX, event.clientY)
	const pos = new Vec2d(mouse.x - bounds.left, mouse.y - bounds.top)
	return pos
}

// returns vector that contains INDICIES, not x,y coords
export function getTileToDraw({ pos, bounds, cols, rows }: { pos: Vec2d, bounds: ClientRect, cols: number, rows: number }): Vec2d {
	return new Vec2d(
		Math.floor(mapValue(pos.x, 0, bounds.width, 0, cols)),
		Math.floor(mapValue(pos.y, 0, bounds.height, 0, rows))
	)
}

export function paintTile({ ctx, tile, tileSize }: { ctx: CanvasRenderingContext2D, tile: Vec2d, tileSize: number }) {
	ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize)
}