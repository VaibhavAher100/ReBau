import React, { useState } from 'react';
import { MaterialRequest, RequestStatus } from '../types';

interface ProfileModalProps {
  requests: MaterialRequest[];
  onClose: () => void;
}

const getStatusColor = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.APPROVED:
    case RequestStatus.COMPLETED:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case RequestStatus.REJECTED:
      return 'bg-red-100 text-red-800 border-red-200';
    case RequestStatus.PENDING:
    default:
      return 'bg-orange-100 text-orange-800 border-orange-200';
  }
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ requests, onClose }) => {
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl pointer-events-auto flex flex-col animate-slide-left border-l border-stone-200">
        
        {/* Profile Header (Hidden when detail view is active on mobile for cleaner look, or just overlay) */}
        {!selectedRequest ? (
            <>
                <div className="bg-white p-6 border-b border-stone-200">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-black text-stone-900">Profile</h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-xl font-bold text-stone-600 border-2 border-white shadow-md">
                            SM
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">Site Manager</h3>
                            <p className="text-sm text-stone-500">BauBay Admin • Nürnberg Region</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Pro Plan</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Request History</h3>
                    
                    {requests.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl bg-stone-100/50">
                            <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <p className="text-stone-500 font-medium text-sm">No requests made yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <div 
                                    key={req.id} 
                                    onClick={() => setSelectedRequest(req)}
                                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group active:scale-[0.99]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-stone-400 group-hover:text-stone-600">#{req.requestId}</span>
                                            <div className="text-xs text-stone-500 mt-0.5">{new Date(req.date).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    
                                    <div className="py-3 border-t border-stone-100 border-dashed">
                                        <div className="text-sm font-medium text-stone-900 mb-1">
                                            {req.items.length} Item{req.items.length !== 1 ? 's' : ''} Requested
                                        </div>
                                        <p className="text-xs text-stone-500 line-clamp-1">
                                            {req.items.map(i => i.name).join(', ')}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-100">
                                        <span className="text-xs font-bold text-stone-500 uppercase">Total Value</span>
                                        <span className="text-sm font-black text-stone-900 flex items-center gap-1">
                                            €{req.totalValue.toLocaleString()}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 group-hover:text-orange-600 transition-colors"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="bg-stone-100 p-6 border-t border-stone-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-600 font-medium">Total Requests</span>
                        <span className="font-bold text-stone-900">{requests.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-stone-600 font-medium">Pending Approvals</span>
                        <span className="font-bold text-orange-600">{requests.filter(r => r.status === RequestStatus.PENDING).length}</span>
                    </div>
                </div>
            </>
        ) : (
            <div className="h-full flex flex-col bg-stone-50 animate-slide-left">
                {/* Detail View Header */}
                <div className="bg-white p-4 border-b border-stone-200 flex items-center gap-3">
                    <button 
                        onClick={() => setSelectedRequest(null)}
                        className="p-2 -ml-2 rounded-full hover:bg-stone-100 text-stone-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h2 className="text-lg font-bold text-stone-900">Request Details</h2>
                    <span className="ml-auto text-xs font-bold text-stone-400">#{selectedRequest.requestId}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                     <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-stone-900">Status</h3>
                                <p className="text-xs text-stone-500">Updated {new Date(selectedRequest.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${getStatusColor(selectedRequest.status)}`}>
                                {selectedRequest.status}
                            </span>
                        </div>
                        <div className="text-xs text-stone-500 leading-relaxed">
                            {selectedRequest.status === RequestStatus.PENDING 
                                ? "This request is currently under review by the site administration. You will be notified once approved."
                                : "This request has been processed."}
                        </div>
                     </div>

                     <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Items Requested</h3>
                     <div className="space-y-3">
                         {selectedRequest.items.map((item, idx) => (
                             <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 flex gap-3 shadow-sm">
                                 <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-stone-100" />
                                 <div className="flex-1">
                                     <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{item.name}</h4>
                                     <p className="text-xs text-stone-500 mt-1">{item.quantity} • {item.location}</p>
                                     <div className="mt-2 text-xs font-bold text-stone-800">€{item.estimatedValue}</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
                
                <div className="bg-white p-6 border-t border-stone-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-600">Total Value</span>
                        <span className="text-2xl font-black text-stone-900">€{selectedRequest.totalValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};