import React, { useState, useRef } from 'react';
import { analyzeBlueprint } from '../services/grokService';
import { co2SavedKg, eurSaved, estimatedNewPrice } from '../services/sustainability';
import { MaterialItem, MaterialCategory } from '../types';

interface BlueprintMatchProps {
  marketplaceItems: MaterialItem[];
  onAddToCart: (item: MaterialItem) => void;
}

interface Requirement {
  name: string;
  category: MaterialCategory;
  quantity: string;
}

interface MatchRow {
  requirement: Requirement;
  matched: MaterialItem | null;
}

export const BlueprintMatch: React.FC<BlueprintMatchProps> = ({ marketplaceItems, onAddToCart }) => {
  const [bomText, setBomText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const matchRequirement = (req: Requirement): MaterialItem | null => {
    const nameLower = req.name.toLowerCase();
    return (
      marketplaceItems.find(
        item =>
          item.isPublished &&
          item.isAvailable &&
          (item.name.toLowerCase().includes(nameLower) ||
            nameLower.includes(item.name.toLowerCase()) ||
            item.category === req.category)
      ) ?? null
    );
  };

  const handleAnalyze = async () => {
    if (!imageBase64 && !bomText.trim()) {
      setError('Upload a blueprint image or paste a BOM text list.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setRows([]);
    try {
      const requirements = await analyzeBlueprint(imageBase64, bomText.trim() || undefined);
      const matched: MatchRow[] = requirements.map(req => ({
        requirement: req,
        matched: matchRequirement(req)
      }));
      setRows(matched);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddAll = () => {
    rows.forEach(row => {
      if (row.matched && !addedIds.has(row.matched.id)) {
        onAddToCart(row.matched);
        setAddedIds(prev => new Set([...prev, row.matched!.id]));
      }
    });
  };

  const handleAddSingle = (item: MaterialItem) => {
    if (!addedIds.has(item.id)) {
      onAddToCart(item);
      setAddedIds(prev => new Set([...prev, item.id]));
    }
  };

  const totalEurSaved = rows
    .filter(r => r.matched)
    .reduce((acc, r) => acc + eurSaved(r.matched!), 0);

  const totalCo2 = rows
    .filter(r => r.matched)
    .reduce((acc, r) => acc + co2SavedKg(r.matched!), 0);

  const matchCount = rows.filter(r => r.matched).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Smart Sourcing</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter mb-2">Blueprint Match</h2>
        <p className="text-stone-500 font-medium max-w-xl">Upload a blueprint or paste a bill of materials. We will match your requirements against available used materials.</p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Blueprint Image Upload */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Blueprint Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] ${
                imageBase64 ? 'border-orange-300 bg-orange-50' : 'border-stone-200 hover:border-orange-400 hover:bg-orange-50/50'
              }`}
            >
              {imageBase64 ? (
                <>
                  <img src={imageBase64} alt="Blueprint" className="max-h-20 object-contain mb-2 rounded-lg" />
                  <span className="text-xs font-bold text-orange-700">{imageName}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageBase64(undefined); setImageName(undefined); }}
                    className="mt-2 text-xs text-stone-400 hover:text-red-500 font-medium"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 mb-3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span className="text-sm font-bold text-stone-400">Click to upload blueprint</span>
                  <span className="text-xs text-stone-300 mt-1">PNG, JPG, PDF</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* BOM Text */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Bill of Materials (text)</label>
            <textarea
              value={bomText}
              onChange={e => setBomText(e.target.value)}
              placeholder={"e.g.\n500 red bricks\n12 timber beams (4m)\n30m copper pipes"}
              className="w-full h-[140px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 font-medium resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none placeholder-stone-300"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 text-sm font-medium px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-stone-900 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:bg-stone-800 disabled:bg-stone-300 transition-all flex items-center gap-2 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Match Materials
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {rows.length > 0 && (
        <>
          {/* Summary Banner */}
          <div className="bg-stone-900 rounded-3xl p-6 mb-6 text-white flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-black">{matchCount}/{rows.length}</div>
                <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-widest">Matched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">€{totalEurSaved.toLocaleString()}</div>
                <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-widest">EUR Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">{Math.round(totalCo2)}kg</div>
                <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-widest">CO2 Saved</div>
              </div>
            </div>
            {matchCount > 0 && (
              <button
                onClick={handleAddAll}
                className="bg-white text-stone-900 font-bold px-6 py-3 rounded-2xl hover:bg-stone-100 transition-colors flex items-center gap-2 active:scale-95 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Add All Matches to Cart
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-stone-400 px-5 py-4">Requirement</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-stone-400 px-5 py-4">Matched Item</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-stone-400 px-5 py-4">Used Price</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-stone-400 px-5 py-4">New Price Est.</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-stone-400 px-5 py-4">EUR Saved</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-stone-400 px-5 py-4">CO2 Saved</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {rows.map((row, idx) => {
                    const matched = row.matched;
                    const saving = matched ? eurSaved(matched) : 0;
                    const co2 = matched ? co2SavedKg(matched) : 0;
                    const newPrice = matched ? estimatedNewPrice(matched) : 0;
                    const isAdded = matched ? addedIds.has(matched.id) : false;

                    return (
                      <tr key={idx} className={`transition-colors ${matched ? 'hover:bg-emerald-50/40' : 'opacity-60 hover:bg-stone-50'}`}>
                        <td className="px-5 py-4">
                          <div className="font-bold text-stone-800">{row.requirement.name}</div>
                          <div className="text-xs text-stone-400 font-medium">{row.requirement.quantity} - {row.requirement.category}</div>
                        </td>
                        <td className="px-5 py-4">
                          {matched ? (
                            <div className="flex items-center gap-3">
                              <img src={matched.imageUrl} alt={matched.name} className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0" />
                              <div>
                                <div className="font-bold text-stone-800">{matched.name}</div>
                                <div className="text-xs text-stone-400 font-medium">{matched.condition} - {matched.quantity}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-lg">No match - buy new</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-stone-800">
                          {matched ? `€${matched.estimatedValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-5 py-4 text-right text-stone-500 font-medium">
                          {matched ? `€${newPrice.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-emerald-700">
                          {matched ? `€${saving.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-emerald-700">
                          {matched ? `${co2}kg` : '-'}
                        </td>
                        <td className="px-5 py-4">
                          {matched && (
                            <button
                              onClick={() => handleAddSingle(matched)}
                              disabled={isAdded}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                                isAdded
                                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                  : 'bg-stone-900 text-white hover:bg-stone-700 active:scale-95'
                              }`}
                            >
                              {isAdded ? 'Added' : 'Add'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="bg-stone-900 text-white">
                    <td className="px-5 py-4 font-black" colSpan={4}>Totals ({matchCount} matched)</td>
                    <td className="px-5 py-4 text-right font-black text-emerald-300">€{totalEurSaved.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right font-black text-emerald-300">{Math.round(totalCo2)}kg</td>
                    <td className="px-5 py-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {rows.length === 0 && !isAnalyzing && (
        <div className="py-20 text-center text-stone-400">
          <div className="mb-6 opacity-20">
            <svg className="w-24 h-24 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="12" x2="15" y2="12"></line>
              <line x1="9" y1="15" x2="12" y2="15"></line>
            </svg>
          </div>
          <p className="font-bold text-lg">Upload a blueprint or paste a BOM to get started.</p>
        </div>
      )}
    </div>
  );
};
