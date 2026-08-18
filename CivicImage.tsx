import React, { useState } from 'react';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';

interface CivicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackCategory?: string;
  containerClassName?: string;
}

export const CivicImage: React.FC<CivicImageProps> = ({
  src,
  alt,
  fallbackCategory = 'Civic Infrastructure',
  containerClassName = '',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse">
          <ImageIcon className="w-8 h-8 text-slate-400 opacity-60" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#071A2B] to-[#EA580C] text-white p-4 text-center">
          <AlertCircle className="w-8 h-8 text-orange-400 mb-2" />
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-200">
            {fallbackCategory}
          </span>
          <span className="text-xs text-slate-300 line-clamp-1 mt-1 font-medium">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          {...props}
        />
      )}
    </div>
  );
};
