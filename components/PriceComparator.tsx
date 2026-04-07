"use client";

import { useState } from "react";
import { Plane, Building, Calendar, DollarSign, ChevronRight, ChevronLeft, Loader2, Search } from "lucide-react";

export default function PriceComparator() {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ flights: number; hotels: number; total: number } | null>(null);

  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert("请先选择出发和返回日期");
      return;
    }

    setLoading(true);
    // 模拟网络请求和价格计算
    setTimeout(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      const flightPrice = Math.floor(Math.random() * 2000) + 800; // 800-2800 之间的往返机票
      const hotelPricePerNight = Math.floor(Math.random() * 800) + 300; // 300-1100 之间的酒店
      const totalHotelPrice = hotelPricePerNight * days;

      setResults({
        flights: flightPrice,
        hotels: totalHotelPrice,
        total: flightPrice + totalHotelPrice
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div 
      className={`fixed right-0 top-1/4 z-50 transition-all duration-500 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-48px)]"
      }`}
    >
      <div className="flex items-start">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl p-3 rounded-l-2xl text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center mt-10"
        >
          {isOpen ? <ChevronRight size={20} /> : <DollarSign size={20} className="animate-pulse" />}
        </button>

        {/* Panel Content */}
        <div className="w-80 h-auto min-h-[400px] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-l-[32px] p-6 flex flex-col relative overflow-hidden">
          {/* Glass highlights */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-xl shadow-lg shadow-green-500/20">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl text-slate-800 tracking-tight">比价窗口</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 ml-1">
                <Calendar className="w-3.5 h-3.5" /> 出发日期
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 ml-1">
                <Calendar className="w-3.5 h-3.5" /> 返程日期
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4" /> 实时查价</>}
            </button>
            
            {/* Results */}
            <div className={`mt-6 space-y-3 transition-opacity duration-300 ${results ? 'opacity-100' : 'opacity-0'}`}>
              {results && (
                <>
                  <div className="p-4 rounded-2xl bg-white/60 border border-white/60 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <Plane className="w-4 h-4 text-blue-500" /> 往返机票
                      </span>
                      <span className="font-bold text-slate-800">¥{results.flights}</span>
                    </div>
                    <div className="h-px w-full bg-slate-200/50" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <Building className="w-4 h-4 text-orange-500" /> 酒店住宿
                      </span>
                      <span className="font-bold text-slate-800">¥{results.hotels}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">预估总价</span>
                    <span className="text-xl font-bold tracking-tight">¥{results.total}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
