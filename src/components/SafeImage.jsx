import { useState } from 'react'

// Image with graceful gradient fallback if the remote photo fails to load.
export default function SafeImage({ src, alt, className = '', fallback = '🍽️' }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-amber-100 text-5xl ${className}`} role="img" aria-label={alt}>
        {fallback}
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}
