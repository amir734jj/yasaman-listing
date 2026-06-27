import { useEffect, useState, type CSSProperties } from 'react';
import ImageLoader from '../image-loader';
import './index.css';

type Kind = 'loading' | 'image' | 'video';

interface MediaViewProps {
  fileId: string;
  className?: string;
  alt?: string;
  onClick?: () => void;
  controls?: boolean;
  muted?: boolean;
  style?: CSSProperties;
  /** Request a small, compressed image from the server instead of the full file. */
  thumb?: boolean;
}

/**
 * Renders a media file addressed only by its id. The listing stores bare file GUIDs, so the
 * type (image vs video) is discovered with a lightweight HEAD request that reads the
 * Content-Type the proxy reconstructs from S3 metadata.
 */
export default function MediaView({
  fileId,
  className,
  alt,
  onClick,
  controls,
  muted,
  style,
  thumb,
}: MediaViewProps) {
  const url = `/api/files/${fileId}`;
  const [kind, setKind] = useState<Kind>('loading');

  useEffect(() => {
    let cancelled = false;
    setKind('loading');
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('Content-Type') ?? '';
        if (!cancelled) setKind(contentType.startsWith('video') ? 'video' : 'image');
      })
      .catch(() => {
        if (!cancelled) setKind('image');
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (kind === 'loading') {
    return <div className={`media-loading ${className ?? ''}`} style={style} />;
  }

  if (kind === 'video') {
    return (
      <video
        src={url}
        className={className}
        style={style}
        controls={controls}
        muted={muted}
        preload="none"
        onClick={onClick}
      />
    );
  }

  // Thumbnails (cards) load the small compressed image directly for speed. Full images go through
  // ImageLoader, which downloads with axios and shows a spinner while the (larger) file transfers.
  if (thumb) {
    return (
      <img
        src={`${url}?thumb=1`}
        className={className}
        style={style}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        onClick={onClick}
      />
    );
  }

  return (
    <ImageLoader src={url} alt={alt} className={className} style={style} onClick={onClick} />
  );
}
