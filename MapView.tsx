
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Post, Category } from '../types';

interface MapViewProps {
  posts: Post[];
  onMarkerClick: (id: string) => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.SAFETY]: '#ef4444', // Red
  [Category.URGENT]: '#f97316', // Orange
  [Category.GIVEAWAY]: '#10b981', // Green
  [Category.SOCIAL_IMPACT]: '#3b82f6', // Blue
  [Category.GENERAL]: '#6b7280', // Gray
};

const MapView: React.FC<MapViewProps> = ({ posts, onMarkerClick }) => {
  const postsWithLocation = posts.filter(p => p.location);
  const center: [number, number] = [38.9072, -77.0369];

  return (
    <div className="h-[60vh] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="h-full w-full"
        aria-label="Community Announcements Map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {postsWithLocation.map((post) => {
          if (!post.location) return null;
          
          return (
            <CircleMarker
              key={post.id}
              center={[post.location.lat, post.location.lng]}
              radius={post.isSolved ? 6 : 10}
              pathOptions={{
                fillColor: post.isSolved ? '#9333ea' : CATEGORY_COLORS[post.category],
                fillOpacity: post.isSolved ? 0.4 : 0.8,
                color: 'white',
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  {post.isSolved && (
                    <span className="text-[10px] font-bold text-purple-600 mb-1 block uppercase">✓ Solved</span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: CATEGORY_COLORS[post.category] }}>
                    {post.category}
                  </span>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <button 
                    onClick={() => onMarkerClick(post.id)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                    aria-label={`View details for post by ${post.authorAlias}`}
                  >
                    View Thread &rarr;
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 z-[1000] text-[10px] font-bold space-y-1">
        <p className="text-gray-400 uppercase tracking-tighter mb-2">Map Legend</p>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
            <span className="text-gray-700">{cat}</span>
          </div>
        ))}
        <div className="flex items-center space-x-2 border-t border-gray-100 pt-1 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 opacity-50"></span>
            <span className="text-purple-700">Solved Status</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
