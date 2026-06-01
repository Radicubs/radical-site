import React, { useEffect, useState, useMemo } from 'react';
import { ChevronDown, Image as ImageIcon } from 'lucide-react';

import SectionHeader from '../ui/SectionHeader.jsx';

const GalleryView = ({ albums = [] }) => {
  const galleryYears = useMemo(() => {
    const years = albums.map(a => a.year).filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => parseInt(b) - parseInt(a));
  }, [albums]);

  const [selectedYear, setSelectedYear] = useState(galleryYears[0] || '2026');

  useEffect(() => {
    if (galleryYears.length > 0 && !galleryYears.includes(selectedYear)) {
      setSelectedYear(galleryYears[0]);
    }
  }, [galleryYears, selectedYear]);

  const displayedAlbums = albums.filter((album) => album.year === selectedYear);

  return (
    <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Photo Gallery" subtitle="A visual look into the heart of Radicubs Robotics." />

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-[#2c303a] pb-6">
          <h3 className="text-3xl font-mono text-white mb-4 sm:mb-0 text-center sm:text-left">
            Gallery Albums
          </h3>
          {galleryYears.length > 0 && (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-[#1b1d23] border border-[#5ddb27] text-white font-mono py-2 pl-4 pr-10 rounded outline-none focus:ring-2 focus:ring-[#5ddb27]/50 cursor-pointer"
              >
                {galleryYears.map((year) => (
                  <option key={year} value={year}>
                    {year} Season
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ddb27] pointer-events-none"
              />
            </div>
          )}
        </div>

        <div className="w-full">
          <div key={selectedYear} className="fade-in-up">
            {displayedAlbums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedAlbums.map((album) => (
                  <a
                    key={album.id}
                    href={`/gallery/${album.slug}`}
                    className="group cursor-pointer rounded-lg overflow-hidden border border-[#2c303a] bg-[#1b1d23] relative aspect-square shadow-lg block"
                  >
                    <div className="absolute inset-0 bg-[#2c303a] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {album.coverPhoto ? (
                        <img src={album.coverPhoto} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center opacity-50">
                          <ImageIcon size={48} className="text-[#101215] mb-2" />
                          <span className="font-mono text-[#101215] text-xs font-bold tracking-widest text-center px-2">
                            NO COVER
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101215]/90 to-transparent p-4 opacity-100 transition-opacity duration-300">
                      <p className="text-white font-mono font-bold text-lg line-clamp-2">{album.title}</p>
                    </div>
                  </a>
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
    </div>
  );
};

export default GalleryView;
