declare module 'next/image' {
  import * as React from 'react';

  export type StaticImageData = {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
    readonly [key: string]: any;
  };

  export interface ImageProps
    extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'height' | 'width' | 'quality'> {
    src: string | StaticImageData;
    alt?: string;
    width?: number | string;
    height?: number | string;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    fill?: boolean;
    sizes?: string;
  }

  const Image: React.FC<ImageProps>;
  export default Image;
}
