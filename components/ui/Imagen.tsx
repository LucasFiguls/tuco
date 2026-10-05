"use client";

import Image, { type ImageProps } from "next/image";
import { CldImage } from "next-cloudinary";

// https://res.cloudinary.com/<cloud>/image/upload/...
const CLOUDINARY_RE = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;

/**
 * Las fotos subidas a Cloudinary las optimiza Cloudinary (formato y calidad automáticos,
 * redimensionado en su CDN) en vez del servidor de Next. El resto (Unsplash, locales) va por next/image.
 */
export function Imagen({ alt, ...props }: ImageProps) {
  const { src } = props;
  const cloudName = typeof src === "string" ? src.match(CLOUDINARY_RE)?.[1] : undefined;
  if (cloudName) {
    // El cloud name sale de la propia URL: no hace falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    return <CldImage {...props} alt={alt} src={src as string} quality={undefined} config={{ cloud: { cloudName } }} />;
  }
  return <Image {...props} alt={alt} />;
}
