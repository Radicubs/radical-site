import React, { useEffect, useState } from 'react';
import { ChevronDown, Image as ImageIcon } from 'lucide-react';
import { SectionHeader } from '../shared/ui.jsx';
import { galleryImages } from '../shared/data.js';

// NEW: PHOTO GALLERY VIEW
const GalleryView = () => {
  const galleryYears = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedImage, setSelectedImage] = useState(null);

  // Sorting logic (descending year)
  const sortedGallery = [...galleryImages].sort((a, b) => parseInt(b.year) - parseInt(a.year));
  
  // Filtering logic based on Team Page pattern
  const displayedImages = sortedGallery.filter(img => img.year === selectedYear);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedImage) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => document.body.style.overflow = 'unset';
  }, [selectedImage]);

  return (
    <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Photo Gallery" subtitle="A visual look into the heart of Radicubs Robotics." />

        {/* Dropdown Filter Match Team Page */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-[#2c303a] pb-6">
          <h3 className="text-3xl font-mono text-white mb-4 sm:mb-0 text-center sm:text-left">Gallery Images</h3>
          <div className="relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-[#1b1d23] border border-[#5ddb27] text-white font-mono py-2 pl-4 pr-10 rounded outline-none focus:ring-2 focus:ring-[#5ddb27]/50 cursor-pointer"
            >
              {galleryYears.map(year => (
                <option key={year} value={year}>{year} Season</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ddb27] pointer-events-none" />
          </div>
        </div>

        <div className="w-full">
          <div key={selectedYear} className="fade-in-up">
            {displayedImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedImages.map((img) => (
                  <div 
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className="group cursor-pointer rounded-lg overflow-hidden border border-[#2c303a] bg-[#1b1d23] relative aspect-square shadow-lg"
                  >
                    {/* Image / Placeholder */}
                    <div className="absolute inset-0 bg-[#2c303a] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {img.url ? (
                         <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                      ) : (
                         <div className="flex flex-col items-center opacity-50">
                           <ImageIcon size={48} className="text-[#101215] mb-2" />
                           <span className="font-mono text-[#101215] text-xs font-bold tracking-widest">IMAGE PLACEHOLDER</span>
                         </div>
                      )}
                    </div>
                    
                    {/* Hover Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101215] to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-mono text-sm line-clamp-2">{img.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#2c303a] rounded-lg py-16 text-center text-[#a9a9a9] font-mono w-full">
                <ImageIcon size={48} className="mx-auto mb-4 text-[#2c303a]" />
                <p>Gallery content coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-[#101215]/95 z-[100] flex items-center justify-center p-4 md:p-12 fade-in-up" 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-[#a9a9a9] hover:text-[#5ddb27] transition-colors z-50 p-2" 
            onClick={() => setSelectedImage(null)}
          >
             <span className="font-mono text-3xl leading-none">✕</span>
          </button>
          
          <div 
            className="relative w-full max-w-5xl aspect-video bg-[#1b1d23] border border-[#2c303a] rounded-lg overflow-hidden flex flex-col items-center justify-center shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
             {selectedImage.url ? (
               <img src={selectedImage.url} alt={selectedImage.caption} className="w-full h-full object-contain bg-black" />
             ) : (
               <div className="flex flex-col items-center h-full justify-center opacity-30">
                 <ImageIcon size={96} className="text-[#d3d3d3] mb-4"/>
                 <span className="font-mono text-[#d3d3d3] tracking-widest">NO IMAGE DATA</span>
               </div>
             )}
             
             {selectedImage.caption && (
               <div className="absolute bottom-0 inset-x-0 bg-[#101215]/90 p-4 backdrop-blur-sm border-t border-[#2c303a]">
                 <p className="text-center font-mono text-[#d3d3d3] text-sm md:text-base">
                   {selectedImage.caption}
                 </p>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export { GalleryView };
