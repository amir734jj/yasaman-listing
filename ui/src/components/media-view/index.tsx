import { useEffect, useState, type CSSProperties } from 'react';
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

  return (
    <img
      src={url}
      className={className}
      style={style}
      alt={alt ?? ''}
      loading="lazy"
      decoding="async"
      onClick={onClick}
    />
  );
}
