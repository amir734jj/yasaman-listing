import { useEffect, useState, type CSSProperties } from 'react';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import './index.css';

interface ImageLoaderProps {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Downloads the full image with axios and shows a spinner while it transfers, then swaps in the
 * decoded image. The blob is held as an object URL (revoked on unmount) rather than a base64 string
 * to avoid the ~33% size overhead and extra memory of data URLs.
 */
export default function ImageLoader({ src, alt, className, style, onClick }: ImageLoaderProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;
    setObjectUrl(null);
    setError(false);

    axios
      .get(src, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(res.data);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  if (error) {
    return <div className={`image-loader-state ${className ?? ''}`} style={style} />;
  }

  if (!objectUrl) {
    return (
      <div className={`image-loader-state ${className ?? ''}`} style={style}>
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <img src={objectUrl} alt={alt ?? ''} className={className} style={style} onClick={onClick} />
  );
}
