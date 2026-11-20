import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface MediaImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function MediaImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  fallbackLabel,
}: MediaImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F3EDFF] via-[#FAF8FF] to-[#EDE7F9] text-[#45207A] ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6 opacity-55" />
        <span className="mt-2 max-w-[80%] truncate px-3 text-center text-xs font-medium text-[#645D78]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
