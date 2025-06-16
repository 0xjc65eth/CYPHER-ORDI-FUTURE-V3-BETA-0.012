import NextImage, { ImageProps as NextImageProps } from 'next/image'
import { forwardRef } from 'react'

export interface ImageProps extends Omit<NextImageProps, 'src'> {
  src: string
}

export const Image = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return <NextImage {...props} ref={ref} />
})

Image.displayName = 'Image'

export default Image 