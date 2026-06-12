import React from 'react';
import { MaterialItem } from '../types';

interface CartDrawerProps {
  items: MaterialItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ items, onRemove, onCheckout, onClose }) => {
  const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl pointer-events-auto flex flex-col animate-slide-left">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Your Cart 
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">{items.length}</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
               </div>
               <p>Your cart is empty.<br/>Browse the marketplace to add items.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1 flex flex-col justify-between">
                   <div>
                     <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                     <p className="text-xs text-gray-500 mt-1">{item.quantity} • {item.location}</p>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-orange-600">€{item.estimatedValue}</span>
                     <button 
                       onClick={() => onRemove(item.id)}
                       className="text-gray-400 hover:text-red-500 text-xs font-medium flex items-center gap-1 p-1"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                       Remove
                     </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total Estimated Value</span>
              <span className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Confirm Pickup Request
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};