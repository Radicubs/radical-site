import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader.jsx';

const AlbumView = ({ album }) => {
  const { title, year, photos } = album;
  
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openLightbox = (index) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  }, [selectedIndex, photos.length]);

  const showPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  }, [selectedIndex, photos.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  return (
    <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <a href="/gallery" className="text-[#a9a9a9] hover:text-[#5ddb27] font-mono text-sm mb-4 inline-block transition-colors">
            ← Back to Gallery
          </a>
          <SectionHeader title={title} subtitle={`${year} Season`} />
        </div>

        {photos && photos.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => openLightbox(index)}
                className="group cursor-pointer rounded-lg overflow-hidden border border-[#2c303a] bg-[#1b1d23] relative shadow-lg break-inside-avoid"
              >
                <div className="relative overflow-hidden w-full h-full bg-[#2c303a]">
                  <img
                    src={photo}
                    alt={`${title} - Photo ${index + 1}`}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white font-mono bg-black/50 px-4 py-2 rounded shadow-lg text-sm">
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#2c303a] rounded-lg py-16 text-center text-[#a9a9a9] font-mono w-full mt-12">
            <ImageIcon size={48} className="mx-auto mb-4 text-[#2c303a]" />
            <p>No photos available in this album.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-[#101215]/95 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-[#a9a9a9] hover:text-[#5ddb27] transition-colors z-50 p-2 bg-[#1b1d23]/80 rounded-full"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-[#a9a9a9] hover:text-[#5ddb27] transition-colors z-50 p-3 bg-[#1b1d23]/80 rounded-full"
              onClick={showPrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedIndex]}
              alt={`${title} - High Res ${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none">
              <span className="text-white font-mono text-sm">
                {selectedIndex + 1} / {photos.length}
              </span>
            </div>
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-[#a9a9a9] hover:text-[#5ddb27] transition-colors z-50 p-3 bg-[#1b1d23]/80 rounded-full"
              onClick={showNext}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumView;
