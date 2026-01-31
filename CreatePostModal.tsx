
import React, { useState, useRef } from 'react';
import { Post, Category } from '../types';
import { processPostContent } from '../services/geminiService';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: Omit<Post, 'id' | 'replies' | 'timestamp' | 'category'> & { category: Category }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [authorAlias, setAuthorAlias] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [manualCategory, setManualCategory] = useState<Category | 'Auto'>('Auto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | undefined>();
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia({
          url: reader.result as string,
          type: file.type.startsWith('video/') ? 'video' : 'image',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGpsRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current GPS Location"
          };
          setLocation(newLoc);
          setAddressInput("Current GPS Location");
        },
        (error) => {
          console.error("Location error:", error);
          alert("Could not access GPS. Please check browser permissions.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // AI Processing
      const processed = await processPostContent(content, addressInput);
      
      // Use AI category if user left it on 'Auto', otherwise use manual choice
      const finalCategory = manualCategory === 'Auto' ? processed.category : manualCategory;
      
      // Use GPS if clicked, otherwise use AI geocoding
      const finalLocation = location || processed.extractedLocation;

      onPostCreated({
        content,
        category: finalCategory,
        authorAlias: authorAlias.trim() || 'anonymous_neighbor',
        media,
        location: finalLocation,
      });
      onClose();
    } catch (err) {
      console.error(err);
      // Final fallback if everything explodes
      onPostCreated({
        content,
        category: manualCategory === 'Auto' ? Category.GENERAL : manualCategory,
        authorAlias: authorAlias.trim() || 'anonymous_neighbor',
        media,
        location: location,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">New Announcement</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[85vh] no-scrollbar">
          {/* Alias */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Alias</label>
            <input
              type="text"
              value={authorAlias}
              onChange={(e) => setAuthorAlias(e.target.value)}
              placeholder="e.g. ward_3_helper (anonymous is default)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share with your neighbors?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-28 resize-none"
              required
            />
          </div>

          {/* Manual Category Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setManualCategory('Auto')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  manualCategory === 'Auto' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                ✨ AI Auto
              </button>
              {Object.values(Category).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setManualCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                    manualCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Address Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Location (Optional)</label>
              <button 
                type="button" 
                onClick={handleGpsRequest}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Use My GPS
              </button>
            </div>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (location && e.target.value !== "Current GPS Location") setLocation(undefined);
              }}
              placeholder="Address or Intersection (e.g. 14th & U)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Photo or Video (Optional)</label>
            {media ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 group border border-gray-200">
                {media.type === 'image' ? (
                  <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={media.url} className="w-full h-full object-cover" />
                )}
                <button 
                  type="button"
                  onClick={() => setMedia(undefined)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 hover:bg-gray-50 hover:border-indigo-300 transition-all text-gray-400 group"
              >
                <svg className="w-8 h-8 mb-1 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Add Media</span>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${
              isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{manualCategory === 'Auto' ? 'Analyzing with AI...' : 'Posting...'}</span>
              </div>
            ) : (
              'Post Announcement'
            )}
          </button>
          {manualCategory === 'Auto' && (
             <p className="text-[10px] text-center text-gray-400 italic">Gemini AI will automatically categorize your message & pinpoint the location.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
