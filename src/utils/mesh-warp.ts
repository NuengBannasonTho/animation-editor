import { random } from 'remotion'
import type { Bump, Camera } from '../types/episode/episode.types'
import { clamp } from './easing'

const CELL_SIZE = 40
const BOIL_AMPLITUDE = 1.1
const SEAM_OVERLAP = 0.6

type Point = { x: number; y: number }

type MeshVertex = {
  /** Where this vertex samples the source image. */
  source: Point
  /** Where this vertex lands on the output canvas. */
  target: Point
}

export type WarpOptions = {
  bumps: Bump[]
  camera: Camera
  /** Changes every few frames to make the outlines "boil". */
  boilSeed: string
}

function getAxis(length: number): number[] {
  const positions: number[] = []
  for (let position = 0; position < length; position += CELL_SIZE) {
    positions.push(position)
  }
  positions.push(length)
  return positions
}

function getCameraBox(camera: Camera, imageWidth: number, imageHeight: number, aspect: number) {
  let width = imageWidth / camera.zoom
  let height = width / aspect
  if (height > imageHeight) {
    height = imageHeight
    width = height * aspect
  }
  const left = clamp(camera.centerX * imageWidth - width / 2, 0, imageWidth - width)
  const top = clamp(camera.centerY * imageHeight - height / 2, 0, imageHeight - height)
  return { left, top, width, height }
}

function buildMesh(image: HTMLImageElement, canvas: HTMLCanvasElement, options: WarpOptions): MeshVertex[][] {
  const imageWidth = image.naturalWidth
  const imageHeight = image.naturalHeight
  const box = getCameraBox(options.camera, imageWidth, imageHeight, canvas.width / canvas.height)
  const scaleX = canvas.width / box.width
  const scaleY = canvas.height / box.height

  return getAxis(imageHeight).map((y, row) =>
    getAxis(imageWidth).map((x, column) => {
      const jitterX = (random(`${options.boilSeed}-${row}-${column}-x`) - 0.5) * 2 * BOIL_AMPLITUDE
      const jitterY = (random(`${options.boilSeed}-${row}-${column}-y`) - 0.5) * 2 * BOIL_AMPLITUDE
      let sourceX = x + jitterX
      let sourceY = y + jitterY
      for (const bump of options.bumps) {
        const distanceX = (x - bump.center[0]) / bump.sigma[0]
        const distanceY = (y - bump.center[1]) / bump.sigma[1]
        const weight = Math.exp(-(distanceX * distanceX + distanceY * distanceY))
        const stretch = bump.stretchY ?? 0
        sourceX -= weight * bump.offset[0]
        sourceY -= weight * bump.offset[1]
        sourceY -= (weight * (y - bump.center[1]) * stretch) / (1 + stretch)
      }
      return {
        source: { x: clamp(sourceX, 0, imageWidth), y: clamp(sourceY, 0, imageHeight) },
        target: { x: (x - box.left) * scaleX, y: (y - box.top) * scaleY },
      }
    }),
  )
}

/** Draws the part of `image` inside source triangle onto the target triangle. */
function drawTriangle(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  a: MeshVertex,
  b: MeshVertex,
  c: MeshVertex,
): void {
  const determinant =
    (b.source.x - a.source.x) * (c.source.y - a.source.y) - (c.source.x - a.source.x) * (b.source.y - a.source.y)
  if (Math.abs(determinant) < 1e-6) {
    return
  }
  // Affine transform that maps source → target for this triangle.
  const m11 =
    ((b.target.x - a.target.x) * (c.source.y - a.source.y) - (c.target.x - a.target.x) * (b.source.y - a.source.y)) /
    determinant
  const m21 =
    ((c.target.x - a.target.x) * (b.source.x - a.source.x) - (b.target.x - a.target.x) * (c.source.x - a.source.x)) /
    determinant
  const m12 =
    ((b.target.y - a.target.y) * (c.source.y - a.source.y) - (c.target.y - a.target.y) * (b.source.y - a.source.y)) /
    determinant
  const m22 =
    ((c.target.y - a.target.y) * (b.source.x - a.source.x) - (b.target.y - a.target.y) * (c.source.x - a.source.x)) /
    determinant
  const dx = a.target.x - m11 * a.source.x - m21 * a.source.y
  const dy = a.target.y - m12 * a.source.x - m22 * a.source.y

  // Grow the clip slightly from its centroid so neighbouring triangles leave no hairline seams.
  const centroidX = (a.target.x + b.target.x + c.target.x) / 3
  const centroidY = (a.target.y + b.target.y + c.target.y) / 3
  const grow = (point: Point): Point => {
    const offsetX = point.x - centroidX
    const offsetY = point.y - centroidY
    const length = Math.hypot(offsetX, offsetY) || 1
    return { x: point.x + (offsetX / length) * SEAM_OVERLAP, y: point.y + (offsetY / length) * SEAM_OVERLAP }
  }
  const [p1, p2, p3] = [grow(a.target), grow(b.target), grow(c.target)]

  context.save()
  context.beginPath()
  context.moveTo(p1.x, p1.y)
  context.lineTo(p2.x, p2.y)
  context.lineTo(p3.x, p3.y)
  context.closePath()
  context.clip()
  context.setTransform(m11, m12, m21, m22, dx, dy)
  context.drawImage(image, 0, 0)
  context.restore()
}

export function drawWarpedImage(canvas: HTMLCanvasElement, image: HTMLImageElement, options: WarpOptions): void {
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('2D canvas context is not available')
  }
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.imageSmoothingQuality = 'high'

  const mesh = buildMesh(image, canvas, options)
  for (let row = 0; row < mesh.length - 1; row++) {
    const upper = mesh[row]
    const lower = mesh[row + 1]
    if (!upper || !lower) {
      continue
    }
    for (let column = 0; column < upper.length - 1; column++) {
      const topLeft = upper[column]
      const topRight = upper[column + 1]
      const bottomLeft = lower[column]
      const bottomRight = lower[column + 1]
      if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
        continue
      }
      const isVisible =
        Math.max(topLeft.target.x, bottomRight.target.x) >= 0 &&
        Math.min(topLeft.target.x, bottomRight.target.x) <= canvas.width &&
        Math.max(topLeft.target.y, bottomRight.target.y) >= 0 &&
        Math.min(topLeft.target.y, bottomRight.target.y) <= canvas.height
      if (!isVisible) {
        continue
      }
      drawTriangle(context, image, topLeft, topRight, bottomRight)
      drawTriangle(context, image, topLeft, bottomRight, bottomLeft)
    }
  }
}
