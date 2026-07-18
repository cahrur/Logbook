import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { issueImageService } from '@/services/issueImage.service';

// Displays an auth-protected image by fetching it as a blob (img tags can't
// send the Bearer token). Revokes the object URL on unmount.
export function AuthImage({ srcId, alt, className, onClick }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let active = true;
    let url;
    issueImageService
      .fetchBlob(srcId)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [srcId]);

  if (!src) {
    return <div className={cn('animate-pulse bg-slate-200 dark:bg-elevated', className)} />;
  }
  return <img src={src} alt={alt} className={className} onClick={onClick} />;
}
