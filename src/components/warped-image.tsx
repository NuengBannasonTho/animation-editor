import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion'
import type { Bump, Camera } from '../types/episode/episode.types'
import { drawWarpedImage } from '../utils/mesh-warp'

type WarpedImageProps = {
  src: string
  width: number
  height: number
  bumps: Bump[]
  camera: Camera
  boilSeed: string
}

/** Draws one still image through a deformable mesh + virtual camera onto a canvas. */
export function WarpedImage({ src, width, height, bumps, camera, boilSeed }: WarpedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [loadHandle] = useState(() => delayRender(`Loading scene image ${src}`))

  useEffect(() => {
    const element = new Image()
    element.onload = () => {
      setImage(element)
      continueRender(loadHandle)
    }
    element.onerror = () => {
      cancelRender(new Error(`Could not load scene image: public/${src}`))
    }
    element.src = staticFile(src)
    return () => {
      element.onload = null
      element.onerror = null
    }
  }, [src, loadHandle])

  // Layout effect: the canvas must be painted before Remotion captures the frame.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) {
      return
    }
    drawWarpedImage(canvas, image, { bumps, camera, boilSeed })
  }, [image, bumps, camera, boilSeed])

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height, display: 'block' }} />
}
