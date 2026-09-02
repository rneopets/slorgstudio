export type Matrix = [number, number, number, number, number, number]

export interface SlorgPath {
  id: string
  d: string
  transform: Matrix
  fill?: string
  stroke?: string
  strokeWidth?: number
}

/** The set of user-configurable visual toggles that affect how a Slorg is drawn, shared by the canvas renderer, the SVG exporter, and their callers. */
export interface SlorgAppearance {
  backgroundColor: string | null
  madEyes: boolean
  spots: boolean
  spotColor: string
  spotOpacity: number
}

const VIEWBOX = { width: 170.66667, height: 170.66667 }

/** Extra margin (viewBox units) added on every side of the render so the Mad Eyes tears aren't clipped at the canvas edge. */
export const PADDING = 16

export const PADDED_VIEWBOX = { width: VIEWBOX.width + PADDING * 2, height: VIEWBOX.height + PADDING * 2 }

/** Bounding box of the body silhouette (BODY_OUTLINE), in viewBox units. Used as the cover-fit crop target. */
export const BODY_BBOX = { x: 10.404, y: 21.408, width: 154.36, height: 142.256 }

/** Closed path tracing the full body silhouette. Used both as the clip region for the user's photo and redrawn as the outline stroke on top. */
export const BODY_OUTLINE: SlorgPath = {
  id: "path19",
  d: "m 0,0 c -0.659,-2.936 2.354,10.503 2.354,10.503 7.64,42.243 -3.532,39.504 -23.381,54.771 -18.594,14.301 -28.807,3.453 -35.005,0.198 -3.857,-2.026 -24.416,-16.91 -24.416,-16.91 0,0 -12.17,-68.337 -3.039,-78.767 10.063,-11.494 112.897,-7.832 114.209,-6.442 1.312,1.388 9.348,13.869 -14.185,15.945 0,0 7.976,31.183 -14.183,31.205",
  transform: [1.3333333, 0.0, 0.0, -1.3333333, 123.49213, 115.34707],
  stroke: "#000000",
  strokeWidth: 4,
}

/** Mouth artwork, in paint order (interior, tongue, smile crease). */
export const MOUTH_PATHS: SlorgPath[] = [
  {
    id: "path20",
    d: "m 0,0 c 6.422,-3.491 26.687,-11.867 58.052,-0.333 0.96,0.353 1.916,-0.536 1.631,-1.519 -2.33,-8.05 -11.202,-33.822 -29.569,-35.067 -18.95,-1.286 -30.74,25.888 -32.307,35.35 C -2.399,-0.33 -1.104,0.6 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 32.731733, 72.386133],
    fill: "#670000",
    stroke: "#000000",
    strokeWidth: 2,
  },
  {
    id: "path21",
    d: "m 0,0 c 0,0 27.496,12.121 47.619,0.573 0,0 -1.558,-2.478 -4.264,-6.316 -2.706,-3.837 -7.284,-8.229 -10.392,-9.95 -3.023,-1.675 -6.244,-2.669 -9.86,-2.554 -3.083,0.099 -6.308,1.236 -9.608,3.178 C 10.512,-13.313 6.38,-9.964 4.019,-6.87 0.991,-2.903 0,0 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 39.557333, 96.3392],
    fill: "#fbc39c",
  },
  {
    id: "path22",
    d: "M 0,0 C 0,0 25.375,13.538 49.495,0.677",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 37.871733, 96.9036],
    stroke: "#000000",
    strokeWidth: 1,
  },
]

/** Eye artwork, in paint order (whites, pupils, highlights). */
export const EYE_PATHS: SlorgPath[] = [
  {
    id: "path23",
    d: "m 0,0 c 0,-11.278 -9.143,-20.42 -20.42,-20.42 -11.278,0 -20.42,9.142 -20.42,20.42 0,11.278 9.142,20.42 20.42,20.42 C -9.143,20.42 0,11.278 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 56.4948, 33.7148],
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 2,
  },
  {
    id: "path24",
    d: "m 0,0 c 0,-11.278 -9.143,-20.42 -20.42,-20.42 -11.278,0 -20.42,9.142 -20.42,20.42 0,11.278 9.142,20.42 20.42,20.42 C -9.143,20.42 0,11.278 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 144.09053, 33.7148],
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 2,
  },
  {
    id: "path25",
    d: "m 0,0 c 0,-5.595 -4.536,-10.13 -10.131,-10.13 -5.595,0 -10.13,4.535 -10.13,10.13 0,5.595 4.535,10.131 10.13,10.131 C -4.536,10.131 0,5.595 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 126.0964, 35.880267],
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 2,
  },
  {
    id: "path26",
    d: "m 0,0 c 0,-2.536 -2.056,-4.591 -4.592,-4.591 -2.535,0 -4.592,2.055 -4.592,4.591 0,2.536 2.057,4.592 4.592,4.592 C -2.056,4.592 0,2.536 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 112.94533, 26.438133],
    fill: "#efefef",
    stroke: "#efefef",
    strokeWidth: 1,
  },
  {
    id: "path27",
    d: "m 0,0 c 0,-5.595 -4.536,-10.13 -10.131,-10.13 -5.595,0 -10.131,4.535 -10.131,10.13 0,5.595 4.536,10.131 10.131,10.131 C -4.536,10.131 0,5.595 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 44.886667, 34.743467],
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 2,
  },
  {
    id: "path28",
    d: "m 0,0 c 0,-2.536 -2.056,-4.592 -4.592,-4.592 -2.536,0 -4.592,2.056 -4.592,4.592 0,2.536 2.056,4.592 4.592,4.592 C -2.056,4.592 0,2.536 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 31.735733, 25.301467],
    fill: "#efefef",
    stroke: "#efefef",
    strokeWidth: 1,
  },
]

/** IDs of the pupil paths within EYE_PATHS, so the renderer can swap their fill in Mad Eyes mode. */
export const PUPIL_PATH_IDS = new Set(["path25", "path27"])

/** IDs of the pupil highlight-dot paths within EYE_PATHS, hidden in Mad Eyes mode. */
export const HIGHLIGHT_PATH_IDS = new Set(["path26", "path28"])

/** Iris color used for the pupils when Mad Slorg Eyes is enabled. */
export const MAD_PUPIL_FILL = "#4a2f00"

/**
 * Pupil transforms used only in Mad Slorg Eyes mode: same shape/size as the normal pupils
 * (path25/path27), but re-centered within each eye white's sclera circle rather than the normal
 * pupils' slightly off-center position, since the eyebrows/tears frame each eye symmetrically.
 */
export const MAD_PUPIL_TRANSFORMS: Record<string, Matrix> = {
  path25: [1.3333333, 0.0, 0.0, -1.3333333, 130.37153034297501, 33.71513333332501],
  path27: [1.3333333, 0.0, 0.0, -1.3333333, 42.77613367629999, 33.71513333332501],
}

/**
 * Optional "Mad Slorg Eyes" overlay: eyebrows and tears, matched to this artwork's sclera centers
 * and radii; the right side is a true mirror of the left.
 *
 * Split into two draw-order groups since each sits on a different side of the eye white: eyebrows
 * are drawn after EYE_PATHS (in front of it), while tears are drawn before EYE_PATHS (behind it)
 * and deliberately oversized to tuck well behind the sclera circle - relying on that circle
 * (rendered on top) to crop them with a perfect edge, rather than on the tear's own traced
 * boundary matching it exactly.
 */
export const MAD_EYEBROW_PATHS: SlorgPath[] = [
  {
    id: "mad-eyebrow-left",
    d: "M 14.142,2.557 c -0.790,0.553 -1.342,1.737 -1.106,2.606 c 0.237,1.342 1.184,1.579 10.108,1.974 c 5.449,0.316 11.292,0.948 13.029,1.500 c 7.660,2.290 13.819,7.739 17.688,15.477 c 2.685,5.370 4.027,6.870 5.843,6.159 c 2.132,-0.790 2.132,-2.527 -0.237,-7.186 c -4.738,-9.397 -13.582,-16.899 -23.453,-19.978 c -6.159,-1.895 -19.583,-2.211 -21.873,-0.553 z",
    transform: [1, 0, 0, 1, 0, 0],
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 4,
  },
  {
    id: "mad-eyebrow-right",
    d: "M 131.916,2.557 c 0.790,0.553 1.342,1.737 1.106,2.606 c -0.237,1.342 -1.184,1.579 -10.108,1.974 c -5.449,0.316 -11.292,0.948 -13.029,1.500 c -7.660,2.290 -13.819,7.739 -17.688,15.477 c -2.685,5.370 -4.027,6.870 -5.843,6.159 c -2.132,-0.790 -2.132,-2.527 0.237,-7.186 c 4.738,-9.397 13.582,-16.899 23.453,-19.978 c 6.159,-1.895 19.583,-2.211 21.873,-0.553 z",
    transform: [1, 0, 0, 1, 0, 0],
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 4,
  },
]

export const MAD_TEAR_PATHS: SlorgPath[] = [
  {
    id: "mad-tear-left",
    d: "M 7.555,54.275 c -13.751,10.329 -18.141,17.076 -18.173,27.889 c 0.000,6.165 1.323,9.974 4.874,13.751 c 2.744,2.905 7.360,5.165 11.395,5.617 c 7.101,0.742 8.134,0.807 11.007,0.484 c 10.233,-1.033 17.011,-6.520 19.464,-15.655 c 1.356,-5.068 2.098,-14.719 1.646,-21.563 l -0.226,-3.809 -2.001,0.258 c -8.748,1.130 -16.721,-1.420 -22.983,-7.392 l -1.937,-1.840 -3.067,2.260 z",
    transform: [1, 0, 0, 1, 2, -2],
    fill: "#55abf2",
  },
  {
    id: "mad-tear-right",
    d: "M 136.302,55.375 c 13.751,10.329 18.141,17.076 18.173,27.889 c -0.000,6.165 -1.323,9.974 -4.874,13.751 c -2.744,2.905 -7.360,5.165 -11.395,5.617 c -7.101,0.742 -8.134,0.807 -11.007,0.484 c -10.233,-1.033 -17.011,-6.520 -19.464,-15.655 c -1.356,-5.068 -2.098,-14.719 -1.646,-21.563 l 0.226,-3.809 2.001,0.258 c 8.748,1.130 16.721,-1.420 22.983,-7.392 l 1.937,-1.840 3.067,2.260 z",
    transform: [1, 0, 0, 1, 3.5, -2],
    fill: "#55abf2",
  },
]

/** Default fill for the decorative body spots overlay. */
export const SPOT_COLOR = "#dee000"
export const SPOT_OPACITY = 1

/** Default flat background color for the body. */
export const DEFAULT_BODY_COLOR = "#a5a600"

/**
 * Decorative spot shapes from the original rainbow body art (paths 8-18: the small
 * accent blobs layered over the big color stripes, as opposed to paths 1-7 which were
 * the stripes themselves and are discarded). Kept as an optional textured overlay on
 * top of the user's photo, since they read as shading/pattern independent of color.
 */
export const SPOT_PATHS: SlorgPath[] = [
  {
    id: "path8",
    d: "m 0,0 c 0.316,-2.447 -1.412,-4.687 -3.859,-5.002 -2.447,-0.316 -4.686,1.412 -5.002,3.858 -0.316,2.447 1.412,4.687 3.859,5.003 C -2.555,4.175 -0.316,2.447 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 145.15107, 153.69987],
  },
  {
    id: "path9",
    d: "m 0,0 c 0,0 -7.802,-8.35 -3.621,-15.762 4.182,-7.413 11.017,-6.624 11.017,-6.624 0,0 3.248,22.217 -7.396,22.386",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 136.44533, 106.73107],
  },
  {
    id: "path10",
    d: "m 0,0 c -1.135,-0.773 -8.623,6.099 -6.304,12.229 2.319,6.13 9.375,4.517 9.375,4.517 0,0 -0.335,-2.692 -1.414,-6.177 C 0.417,6.566 0.382,0.261 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 123.50453, 109.85547],
  },
  {
    id: "path11",
    d: "m 0,0 c -0.205,0.878 -0.843,3.365 -1.852,3.665 -0.851,0.252 -0.851,1.236 -0.371,1.71 -1.749,1.322 -4.159,2.141 -6.821,2.141 -5.343,0 -9.674,-3.294 -9.674,-7.357 0,-2.081 1.141,-3.957 2.968,-5.295 0.16,0.169 0.382,0.289 0.682,0.295 1.376,0.027 2.804,0.217 4.138,-0.227 1.319,-0.44 2.549,-1.227 3.701,-1.996 3.608,0.521 6.504,2.564 7.492,5.217 C 0.219,-1.22 0.14,-0.6 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 107.51627, 149.3828],
  },
  {
    id: "path12",
    d: "M 0,0 C 0.282,2.716 2.239,21.018 3.285,20.59 6.246,19.378 15.327,14.53 14.839,2.781 14.839,2.781 14.2,-12.614 0,-16.88 0,-16.88 -0.808,-7.779 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 7.6341333, 127.20053],
  },
  {
    id: "path13",
    d: "m 0,0 c 0,0 1.912,-7.293 7.109,-8.524 5.198,-1.232 11.862,4.319 11.946,6.561 0.047,1.238 -4.096,3.192 -8.933,3.999 C 5.567,2.796 1.616,1.856 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 61.388667, 22.658267],
  },
  {
    id: "path14",
    d: "m 0,0 c 0,0 5.714,2.433 7.474,4.688 1.759,2.256 0.595,6.369 0.595,6.369 0,0 -6.117,1.627 -8.562,-4.113 0,0 -1.487,-3.801 0.493,-6.944",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 115.748, 102.01427],
  },
  {
    id: "path15",
    d: "m 0,0 c 0,0 -12.864,7.211 -13.036,8.167 -0.172,0.956 -0.812,-26.473 0.178,-26.623 C -11.869,-18.606 -0.774,-11.981 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 27.330133, 125.0964],
  },
  {
    id: "path16",
    d: "m 0,0 c 0,0 11.379,8.673 13.438,10.556 0,0 4.275,-3.085 2.687,-7.188 -1.513,-3.912 -5.167,-5.095 -5.167,-5.095 0,0 -5.092,-1.721 -10.958,1.727",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 86.424533, 156.1432],
  },
  {
    id: "path17",
    d: "m 0,0 c 0,0 5.881,10.055 6.598,10.055 0.717,0 0.198,-12.745 0,-12.861 C 6.401,-2.921 1.337,-1.736 0,0",
    transform: [1.3333333, 0.0, 0.0, -1.3333333, 136.25267, 133.28707],
  },
  // path18 omitted: a tiny sliver clipped hard against the outline edge in the source art,
  // reads as a stray fragment rather than a spot once isolated from its neighboring rainbow fill.
]
