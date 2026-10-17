async function fileToResizedCanvas(file: File, maxSize: number): Promise<HTMLCanvasElement> {
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Reads an image file and downsizes it to keep localStorage usage small.
 * Swap for a real upload (S3, Cloudinary, …) once there is a backend.
 */
export async function fileToResizedDataUrl(file: File, maxSize = 900): Promise<string> {
  const canvas = await fileToResizedCanvas(file, maxSize);
  return canvas.toDataURL('image/jpeg', 0.85);
}

/** Same as above but as a JPEG Blob, for uploading to Supabase Storage. */
export async function fileToResizedBlob(file: File, maxSize = 1600): Promise<Blob> {
  const canvas = await fileToResizedCanvas(file, maxSize);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read that image.'))), 'image/jpeg', 0.9),
  );
}
