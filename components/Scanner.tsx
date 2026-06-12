
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMaterialImage } from '../services/geminiService';
import { AnalysisResult, MaterialCategory, Condition } from '../types';

interface ScannerProps {
  onAddInventory: (analysis: AnalysisResult, image: string, quantity: string, location: string, value: number, coords?: { lat: number, lng: number }) => void;
  onCancel: () => void;
}

type ViewState = 'camera' | 'analyzing' | 'results' | 'editing';

export const Scanner: React.FC<ScannerProps> = ({ onAddInventory, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('camera');
  
  const [detectedItems, setDetectedItems] = useState<AnalysisResult[]>([]);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  
  // Editor State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>(MaterialCategory.OTHER);
  const [condition, setCondition] = useState<Condition>(Condition.GOOD);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState('Gostenhof Site');
  const [estimatedValue, setEstimatedValue] = useState('0');
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get geolocation on mount
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.warn("Geolocation error:", error);
            }
        );
    }
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImage(base64String);
      setViewState('analyzing');
      setDetectedItems([]);
      setAddedIndices(new Set());
      
      try {
        const results = await analyzeMaterialImage(base64String);
        setDetectedItems(results);
        setViewState('results');
      } catch (error) {
        console.error(error);
        alert("Failed to analyze image. Please try again.");
        setImage(null);
        setViewState('camera');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditItem = (index: number) => {
    const item = detectedItems[index];
    setEditingIndex(index);
    setName(item.name);
    setCategory(item.category);
    setCondition(item.condition);
    setDescription(item.description);
    setQuantity(item.quantity || '1');
    setEstimatedValue(item.estimatedValue.toString());
    setViewState('editing');
  };

  const saveItemToInventory = (index: number, data: AnalysisResult) => {
    if (!image) return;
    onAddInventory(
        data, 
        image, 
        quantity, 
        location, 
        data.estimatedValue,
        locationCoords
    );
    const newAdded = new Set(addedIndices);
    newAdded.add(index);
    setAddedIndices(newAdded);
  };

  const handleSaveEditedItem = () => {
    if (editingIndex !== null && image) {
      const originalItem = detectedItems[editingIndex];
      const finalItem: AnalysisResult = {
        ...originalItem,
        name,
        category,
        condition,
        description,
        quantity,
        estimatedValue: parseFloat(estimatedValue) || 0
      };
      
      onAddInventory(finalItem, image, quantity, location, finalItem.estimatedValue, locationCoords);
      
      const newAdded = new Set(addedIndices);
      newAdded.add(editingIndex);
      setAddedIndices(newAdded);
      
      setViewState('results');
      setEditingIndex(null);
    }
  };

  const handleBatchSaveAndScanMore = () => {
      // Save all items that haven't been added yet
      detectedItems.forEach((item, index) => {
          if (!addedIndices.has(index)) {
              onAddInventory(item, image!, item.quantity || "1", location, item.estimatedValue, locationCoords);
          }
      });
      // Reset to camera for next batch
      setImage(null);
      setDetectedItems([]);
      setAddedIndices(new Set());
      setViewState('camera');
      // Re-trigger camera
      setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleBatchSaveAndFinish = () => {
      // Save all remaining
       detectedItems.forEach((item, index) => {
          if (!addedIndices.has(index)) {
              onAddInventory(item, image!, item.quantity || "1", location, item.estimatedValue, locationCoords);
          }
      });
      onCancel();
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  // 1. CAMERA VIEW
  if (viewState === 'camera') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 animate-fade-in bg-gray-50 relative">
        <button 
            onClick={onCancel}
            className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 transition-colors z-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl shadow-orange-100 border border-orange-50">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                <svg className="w-12 h-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Batch</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Take a wide shot. AI will detect items, tag GPS location, and prepare them for the marketplace.
            </p>
             
            {locationCoords ? (
                <div className="mb-8 flex justify-center items-center gap-2 text-xs text-green-600 bg-green-50 py-1 px-3 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                     GPS Location Active
                </div>
            ) : (
                <div className="mb-8 flex justify-center items-center gap-2 text-xs text-gray-400 bg-gray-100 py-1 px-3 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                     Acquiring Location...
                </div>
            )}
            
            <button 
              onClick={triggerCamera}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              Open Camera
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. ANALYZING VIEW
  if (viewState === 'analyzing') {
    return (
        <div className="h-screen flex flex-col bg-gray-900 relative overflow-hidden">
             <img src={image!} alt="Analyzing" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
             <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-t-4 border-b-4 border-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <svg className="w-8 h-8 text-white animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Scanning Batch...</h3>
                <p className="text-gray-300">Detecting multiple items & tagging location</p>
             </div>
        </div>
    );
  }

  // 3. RESULTS VIEW (Segmented View)
  if (viewState === 'results') {
      const itemsToAddCount = detectedItems.length - addedIndices.size;
      
      return (
        <div className="h-screen flex flex-col bg-gray-50 animate-fade-in overflow-hidden">
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
                <button 
                  onClick={onCancel}
                  className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white p-2 rounded-full hover:bg-black/70 z-50"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>

                {/* Resizable Container to fit image ratio */}
                <div className="relative max-h-full max-w-full shadow-2xl">
                    <img 
                        src={image!} 
                        alt="Analyzed" 
                        className="max-h-[50vh] md:max-h-[65vh] w-auto object-contain block" 
                    />
                    
                    {/* Bounding Boxes Overlay */}
                    <div className="absolute inset-0">
                        {detectedItems.map((item, index) => {
                            if (!item.box_2d) return null;
                            const [ymin, xmin, ymax, xmax] = item.box_2d;
                            const isAdded = addedIndices.has(index);
                            
                            return (
                                <div 
                                    key={index}
                                    onClick={() => handleEditItem(index)}
                                    className="absolute transition-all cursor-pointer z-20 group"
                                    style={{
                                        top: `${ymin * 100}%`,
                                        left: `${xmin * 100}%`,
                                        height: `${(ymax - ymin) * 100}%`,
                                        width: `${(xmax - xmin) * 100}%`
                                    }}
                                >
                                    {/* Bounding Box Border */}
                                    <div className={`w-full h-full border-2 transition-colors duration-300 ${isAdded ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/90 shadow-[0_0_10px_rgba(0,0,0,0.3)]'}`}></div>
                                    
                                    {/* Floating Label (Just Name) */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                        <div className={`px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-md border transition-colors duration-300 ${
                                            isAdded 
                                            ? 'bg-emerald-500 text-white border-emerald-400' 
                                            : 'bg-white/95 text-gray-900 border-white/50'
                                        }`}>
                                            {isAdded && (
                                                <div className="bg-white/20 rounded-full p-0.5">
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            )}
                                            <span className="text-xs font-bold whitespace-nowrap max-w-[120px] truncate">{item.name}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* List View Below */}
            <div className="h-[40vh] bg-white rounded-t-3xl relative z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Detected Items</h2>
                        <p className="text-xs text-gray-500">Tap to edit details before saving</p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">
                        {detectedItems.length} Found
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {detectedItems.map((item, index) => {
                         const isAdded = addedIndices.has(index);
                         return (
                            <div 
                                key={index}
                                onClick={() => handleEditItem(index)}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all active:scale-[0.98] cursor-pointer ${isAdded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-orange-200 shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${isAdded ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {isAdded ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-sm truncate ${isAdded ? 'text-green-900' : 'text-gray-900'}`}>{item.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span className="capitalize text-gray-600 font-medium">Qty: {item.quantity}</span>
                                        <span>•</span>
                                        <span>{item.category}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900">€{item.estimatedValue}</div>
                                </div>
                            </div>
                         );
                    })}
                </div>
                
                <div className="p-4 bg-white border-t border-gray-100 flex gap-3 pb-8">
                     <button 
                        onClick={handleBatchSaveAndScanMore}
                        className="flex-1 bg-white text-gray-900 border border-gray-200 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        Scan More
                    </button>
                     <button 
                        onClick={handleBatchSaveAndFinish}
                        className="flex-1 bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <span>Save {itemsToAddCount > 0 ? `(${itemsToAddCount})` : ''} & Finish</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // 4. EDITING VIEW
  if (viewState === 'editing' && editingIndex !== null) {
      return (
        <div className="h-screen flex flex-col bg-white animate-slide-up">
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white">
                <button 
                    onClick={() => setViewState('results')}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-black"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h2 className="text-lg font-bold text-black">Edit Item Details</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="space-y-6">
                    {/* Location Badge */}
                    {locationCoords && (
                        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                             <span>Location pinned: {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}</span>
                        </div>
                    )}

                    {/* Score Card */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold text-orange-800 uppercase">Score</span>
                            <div className="text-2xl font-black text-gray-900">{detectedItems[editingIndex].reusabilityScore}/100</div>
                        </div>
                         <span className="px-3 py-1 bg-white text-orange-700 text-xs font-bold rounded-lg shadow-sm border border-orange-100">
                            {detectedItems[editingIndex].suggestedAction}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Material Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-xl font-semibold text-black placeholder-gray-400 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value as MaterialCategory)} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-black focus:ring-2 focus:ring-orange-500 outline-none shadow-sm">
                                    {Object.values(MaterialCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Condition</label>
                                <select value={condition} onChange={e => setCondition(e.target.value as Condition)} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-black focus:ring-2 focus:ring-orange-500 outline-none shadow-sm">
                                    {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Description</label>
                            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm text-black focus:ring-2 focus:ring-orange-500 outline-none resize-none shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Quantity</label>
                                <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-black focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Est. Value (€)</label>
                                <input type="number" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-black focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
                <button 
                    onClick={handleSaveEditedItem}
                    className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Save Changes
                </button>
            </div>
        </div>
      );
  }

  return null;
};
