
import React, { useState } from 'react';
import { MaterialItem, Condition } from '../types';

interface ItemDetailsProps {
  item: MaterialItem;
  onClose: () => void;
  onAddToCart?: (item: MaterialItem) => void;
  onOpenCart?: () => void;
  isInCart?: boolean;
  isMarketplace: boolean;
  onPublish?: (id: string, updates: Partial<MaterialItem>) => void;
}

const getConditionColor = (condition: Condition) => {
  switch(condition) {
    case Condition.NEW: return 'bg-emerald-100 text-emerald-800';
    case Condition.GOOD: return 'bg-blue-100 text-blue-800';
    case Condition.FAIR: return 'bg-yellow-100 text-yellow-800';
    case Condition.POOR: return 'bg-orange-100 text-orange-800';
    case Condition.SCRAP: return 'bg-red-100 text-red-800';
    default: return 'bg-stone-100 text-stone-800';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onClose, onAddToCart, onOpenCart, isInCart, isMarketplace, onPublish }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [accessInfo, setAccessInfo] = useState(item.accessRequirements || 'Standard Site Access');
  const [pickupTime, setPickupTime] = useState(item.pickupTimes || 'Mon-Fri 08:00 - 16:00');

  const handlePublishClick = () => {
    setIsPublishing(true);
  };

  const confirmPublish = () => {
      if(onPublish) {
          onPublish(item.id, {
              accessRequirements: accessInfo,
              pickupTimes: pickupTime
          });
      }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] overflow-y-auto animate-slide-up flex flex-col font-sans min-h-[100dvh]">
       {/* Fixed Header for consistent navigation */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
        <button 
          onClick={onClose}
          className="pointer-events-auto bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/50 transition-colors shadow-lg border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/20">
            <span className="text-stone-900 text-xs font-bold tracking-widest uppercase">{item.category}</span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="h-[40vh] w-full bg-stone-900 shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Content */}
      <div className="px-6 pb-40 -mt-10 relative flex-1 z-10">
        
        {/* INTERNAL MATCH BANNER */}
        {!isMarketplace && item.internalProjectMatch && (
            <div className="bg-white rounded-2xl p-5 mb-8 shadow-xl shadow-indigo-900/10 border border-indigo-50 relative z-20 transform -translate-y-4">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-2xl"></div>
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-indigo-900 font-bold text-base leading-tight">Internal Match Found</h4>
                        <p className="text-indigo-600/80 text-xs font-medium">Recommended for reuse within company</p>
                    </div>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                    <p className="text-sm font-bold text-indigo-900">{item.internalProjectMatch}</p>
                    <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                        Transfer
                    </button>
                </div>
            </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-6">
             <h1 className="text-3xl font-black text-stone-900 leading-tight mb-3 tracking-tight">{item.name}</h1>
             <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${getConditionColor(item.condition)}`}>
                  {item.condition}
                </span>
                <span className="text-stone-300 text-xs">•</span>
                <span className="text-stone-500 text-xs font-medium">Added {new Date(item.dateAdded).toLocaleDateString()}</span>
             </div>
          </div>
          <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-stone-100 shadow-lg shadow-stone-200/50 shrink-0">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">Score</span>
            <span className={`text-3xl font-black ${getScoreColor(item.reusabilityScore)}`}>{item.reusabilityScore}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-stone-900 mb-2 uppercase tracking-wide opacity-80">Description</h3>
          <p className="text-stone-600 leading-relaxed text-base">{item.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <div className="text-stone-400 text-xs uppercase font-bold mb-2 tracking-wider">Quantity</div>
              <div className="text-stone-900 font-bold text-xl">{item.quantity}</div>
           </div>
           <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <div className="text-stone-400 text-xs uppercase font-bold mb-2 tracking-wider">Est. Value</div>
              <div className="text-stone-900 font-bold text-xl">€{item.estimatedValue.toLocaleString()}</div>
           </div>
        </div>

        {/* Additional Metadata */}
        <div className="border-t border-stone-100 pt-8">
          <h3 className="font-bold text-stone-900 mb-5 text-lg">Logistics Information</h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               </div>
               <div className="flex-1">
                 <span className="block font-bold text-stone-900 mb-1">Pickup Location</span>
                 <span className="text-stone-600 text-sm block mb-2">{item.location}</span>
                 {item.coordinates && (
                     <div className="inline-flex text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100 items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                         {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                     </div>
                 )}
               </div>
            </div>
             
             {isPublishing ? (
                 <div className="bg-orange-50/80 p-6 rounded-2xl border border-orange-200 animate-fade-in">
                     <div className="mb-4">
                         <label className="text-xs font-bold text-orange-900 uppercase mb-2 block">Access Requirements</label>
                         <input 
                            type="text" 
                            value={accessInfo} 
                            onChange={(e) => setAccessInfo(e.target.value)} 
                            className="w-full p-3 border border-orange-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                         />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-orange-900 uppercase mb-2 block">Pickup Times</label>
                         <input 
                            type="text" 
                            value={pickupTime} 
                            onChange={(e) => setPickupTime(e.target.value)} 
                            className="w-full p-3 border border-orange-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                         />
                     </div>
                 </div>
             ) : (
                <>
                    <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                        <span className="block font-bold text-stone-900 mb-1">Pickup Times</span>
                        <span className="text-stone-600 text-sm">{item.pickupTimes || 'Contact for details'}</span>
                    </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <div>
                        <span className="block font-bold text-stone-900 mb-1">Access Info</span>
                        <span className="text-stone-600 text-sm">{item.accessRequirements || 'Standard Access'}</span>
                    </div>
                    </div>
                </>
             )}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 p-5 px-6 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto">
        {isMarketplace ? (
            <div className="w-full flex gap-3">
                {isInCart ? (
                    <>
                        <button 
                            disabled
                            className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-4 rounded-xl border border-emerald-200 shadow-none flex items-center justify-center gap-2 cursor-default"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Added
                        </button>
                        <button 
                            onClick={onOpenCart}
                            className="flex-[2] bg-stone-900 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-stone-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            View Cart
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => onAddToCart && onAddToCart(item)}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Add to Cart
                    </button>
                )}
            </div>
        ) : (
           /* INVENTORY ACTION BAR */
           isPublishing ? (
               <button 
                onClick={confirmPublish}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-emerald-500"
              >
                Confirm & Publish Now
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
           ) : (
              <div className="flex gap-4">
                  <button 
                    className="flex-1 bg-stone-100 text-stone-600 font-bold py-4 rounded-xl hover:bg-stone-200 transition-colors"
                    onClick={onClose}
                  >
                    Back
                  </button>
                  {!item.isPublished ? (
                      <button 
                        onClick={handlePublishClick}
                        className="flex-[2] bg-stone-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-stone-300 active:scale-[0.98] transition-all hover:bg-stone-800"
                      >
                        Publish to Marketplace
                      </button>
                  ) : (
                      <button 
                        disabled
                        className="flex-[2] bg-emerald-50 text-emerald-700 font-bold py-4 rounded-xl border border-emerald-200 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Listed on Marketplace
                      </button>
                  )}
              </div>
           )
        )}
        </div>
      </div>
    </div>
  );
};
