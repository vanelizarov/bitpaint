export interface Color {
	colorId: number
	hexString: string
	rgb: {
		r: number
		g: number
		b: number
	}
	hsl: {
		h: number
		s: number
		l: number
	}
	name: string
}

const COLOR_DEFS_PATH = '/assets/colors.json'

export async function getColors(): Promise<Color[]> {
	const res = await fetch(COLOR_DEFS_PATH)
	const json: Color[] = await res.json()

	const misc = json.splice(0, 16)

	return [...json, ...misc]
}