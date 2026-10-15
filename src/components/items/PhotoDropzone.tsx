import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { fileToResizedDataUrl } from '@/utils/image';
import { Icon } from '@/components/ui/Icon';
import styles from './PhotoDropzone.module.css';

interface PhotoDropzoneProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  /** Shown behind the prompt when there's no photo (e.g. a live placeholder preview). */
  children?: ReactNode;
}

export function PhotoDropzone({ value, onChange, children }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file?: File) => {
    if (file?.type.startsWith('image/')) onChange(await fileToResizedDataUrl(file));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ''} ${value ? styles.filled : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {value ? (
        <>
          <img src={value} alt="Item preview" />
          <button type="button" className={styles.remove} onClick={() => onChange(undefined)}>
            <Icon name="close" size={16} /> Remove
          </button>
        </>
      ) : (
        <>
          {children && <div className={styles.preview}>{children}</div>}
          <button type="button" className={styles.prompt} onClick={() => inputRef.current?.click()}>
            <span className={styles.icon}>
              <Icon name="upload" />
            </span>
            <strong>Upload a photo</strong>
            <span>or drag &amp; drop</span>
          </button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
