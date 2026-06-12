import React, { useState } from 'react';
import { MaterialItem, Condition } from '../types';

interface InventoryCardProps {
  item: MaterialItem;
  isMarketplace?: boolean;
  onClick: (item: MaterialItem) => void;
}

const getConditionColor = (condition: Condition) => {
  switch(condition) {
    case Condition.NEW: return 'bg-emerald-100/90 text-emerald-800 border-emerald-200';
    case Condition.GOOD: return 'bg-blue-100/90 text-blue-800 border-blue-200';
    case Condition.FAIR: return 'bg-yellow-100/90 text-yellow-800 border-yellow-200';
    case Condition.POOR: return 'bg-orange-100/90 text-orange-800 border-orange-200';
    case Condition.SCRAP: return 'bg-red-100/90 text-red-800 border-red-200';
    default: return 'bg-stone-100/90 text-stone-800 border-stone-200';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, isMarketplace = false, onClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      onClick={() => onClick(item)}
      className="group bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-orange-100 hover:-translate-y-1 cursor-pointer relative"
    >
      {/* Internal Match Badge */}
      {!isMarketplace && item.internalProjectMatch && !item.isPublished && (
          <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold py-1.5 px-3 rounded-full z-20 shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              INTERNAL MATCH
          </div>
      )}

      <div className="relative h-56 overflow-hidden bg-stone-100">
        {!imgError ? (
           <img 
             src={item.imageUrl} 
             alt={item.name} 
             className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
             onError={() => setImgError(true)}
           />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-300">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                 <span className="text-xs font-medium mt-2">No Image</span>
            </div>
        )}

        {/* Floating Condition Badge */}
        <div className="absolute top-4 right-4">
           <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm uppercase tracking-wide shadow-sm ${getConditionColor(item.condition)}`}>
             {item.condition}
           </span>
        </div>
        
        {/* Distance Badge (Marketplace) */}
        {isMarketplace && (
            <div className="absolute bottom-4 right-4 bg-stone-900/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               {item.distance || 'Unknown'}
            </div>
        )}
        
        {/* Location Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent p-5 pt-16">
            <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-md group-hover:text-orange-100 transition-colors">{item.name}</h3>
            <p className="text-stone-300 text-xs flex items-center gap-1.5 mt-1 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {item.location}
            </p>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100 group-hover:border-orange-100 transition-colors">{item.category}</span>
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100 group-hover:border-orange-100 transition-colors" title="Reusability Score">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={getScoreColor(item.reusabilityScore)}><path d="M23 12a11 11 0 0 1-20.73 4.62C2.05 16.1 2 15.56 2 15a11 11 0 0 1 11-11v11z"></path></svg>
               <span className={`text-sm font-black ${getScoreColor(item.reusabilityScore)}`}>{item.reusabilityScore}</span>
            </div>
          </div>
          <p className="text-stone-500 text-sm line-clamp-2 mb-4 leading-relaxed font-medium opacity-80">{item.description}</p>
          
          <div className="flex items-end justify-between mt-auto pt-4 border-t border-stone-100 border-dashed">
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wide">
               Qty <span className="text-stone-900 ml-1 text-sm normal-case">{item.quantity}</span>
            </div>
            <div className="text-xl font-black text-stone-900 tracking-tight group-hover:text-orange-600 transition-colors">
                €{item.estimatedValue.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Card Actions / Status */}
        <div className="mt-4 flex justify-between items-center">
            {!isMarketplace && !item.isPublished && (
                <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                    Draft
                </span>
            )}
            {!isMarketplace && item.isPublished && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg uppercase tracking-wide flex items-center gap-1.5 border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Published
                </span>
            )}
             {isMarketplace && (
                 <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1 ml-auto group-hover:translate-x-1 transition-all">
                     View Details <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                 </span>
             )}
        </div>
      </div>
    </div>
  );
};