import { useState, useEffect } from 'react';

interface ImageGalleryProps {
  images: string[];
  featuredImage?: string;
  projectTitle: string;
}

export function ImageGallery({ images, featuredImage, projectTitle }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Combine featured image with gallery images
  const allImages = featuredImage
    ? [featuredImage, ...images]
    : images;

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) =>
          prev !== null && prev < allImages.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allImages.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < allImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <>
      {/* Featured Image */}
      {featuredImage && (
        <div
          className="cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--bg-surface)' }}
          onClick={() => openLightbox(0)}
        >
          <img
            src={featuredImage}
            alt={projectTitle}
            className="w-full h-auto"
          />
          <div className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
            [click to enlarge]
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div>
          <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>$ ls images/</div>
          <div className="grid grid-cols-2 gap-3">
            {images.map((img: string, idx: number) => {
              const actualIndex = featuredImage ? idx + 1 : idx;
              return (
                <div
                  key={idx}
                  className="cursor-pointer hover:opacity-80 transition-opacity group relative"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                  onClick={() => openLightbox(actualIndex)}
                >
                  <img
                    src={img}
                    alt={`${projectTitle} - ${idx + 1}`}
                    className="w-full h-auto"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--link-color)' }}>[click]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 hover:opacity-70 transition-opacity text-2xl z-10"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Close lightbox"
          >
            [×]
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-sm z-10" style={{ color: 'var(--link-color)' }}>
            $ viewing image {selectedIndex + 1}/{allImages.length}
          </div>

          {/* Navigation Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs z-10" style={{ color: 'var(--text-muted)' }}>
            [← → to navigate | ESC to close]
          </div>

          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity text-4xl z-10"
              style={{ color: 'var(--link-color)' }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < allImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity text-4xl z-10"
              style={{ color: 'var(--link-color)' }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image Container */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[selectedIndex]}
              alt={`${projectTitle} - ${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain border-2"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
