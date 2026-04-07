"use client";

import React, { useState, useMemo } from "react";
import { Plane, Building, Calendar, Search, MapPin, ChevronDown, ChevronUp, Filter, ArrowDownUp } from "lucide-react";

const CITIES = {
  "国内热门": [
    { name: "北京", code: "BJS" },
    { name: "上海", code: "SHA" },
    { name: "广州", code: "CAN" },
    { name: "深圳", code: "SZX" },
    { name: "成都", code: "CTU" },
    { name: "杭州", code: "HGH" },
    { name: "重庆", code: "CKG" },
  ],
  "国际及港澳台": [
    { name: "香港", code: "HKG" },
    { name: "东京", code: "TYO" },
    { name: "首尔", code: "SEL" },
    { name: "曼谷", code: "BKK" },
    { name: "新加坡", code: "SIN" },
    { name: "巴黎", code: "PAR" },
    { name: "伦敦", code: "LON" },
    { name: "纽约", code: "NYC" }
  ]
};

export default function PricesPage() {
  const [origin, setOrigin] = useState("BJS");
  const [destination, setDestination] = useState("SHA");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flightData, setFlightData] = useState<any[]>([]);
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  
  const [showAllFlights, setShowAllFlights] = useState(false);
  const [showAllHotels, setShowAllHotels] = useState(false);

  // Filters
  const [flightSort, setFlightSort] = useState("recommended"); // recommended, price_asc, price_desc
  const [flightAirline, setFlightAirline] = useState("全部");
  const [hotelCategory, setHotelCategory] = useState("全部");

  const handleSearch = async () => {
    if (!departDate || !returnDate) return;
    setLoading(true);
    setShowResults(false);
    setShowAllFlights(false);
    setShowAllHotels(false);
    
    try {
      const res = await fetch(`/api/prices?origin=${origin}&destination=${destination}&departDate=${departDate}&returnDate=${returnDate}`);
      const data = await res.json();
      
      if (res.ok) {
        setFlightData(data.flights);
        setHotelData(data.hotels);
        setLastUpdated(data.updatedAt);
        setShowResults(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const airlines = useMemo(() => {
    const set = new Set(flightData.map(f => f.airline));
    return ["全部", ...Array.from(set)];
  }, [flightData]);

  const hotelCategories = ["全部", "经济型", "商旅/四星", "豪华/五星"];

  const filteredFlights = useMemo(() => {
    let result = [...flightData];
    if (flightAirline !== "全部") {
      result = result.filter(f => f.airline === flightAirline);
    }
    if (flightSort === "price_asc") {
      result.sort((a, b) => a.numPrice - b.numPrice);
    } else if (flightSort === "price_desc") {
      result.sort((a, b) => b.numPrice - a.numPrice);
    }
    return result;
  }, [flightData, flightAirline, flightSort]);

  const filteredHotels = useMemo(() => {
    if (hotelCategory === "全部") return hotelData;
    return hotelData.filter(h => h.category === hotelCategory);
  }, [hotelData, hotelCategory]);

  const displayedFlights = showAllFlights ? filteredFlights : filteredFlights.slice(0, 3);
  const displayedHotels = showAllHotels ? filteredHotels : filteredHotels.slice(0, 3);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen pb-24">
      <div className="mb-10 mt-6 md:mt-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4 flex items-center gap-4">
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
            <Search className="w-8 h-8 text-white" />
          </span>
          查询价格
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          连接真实航司数据，一键比对全网超值特价
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-[32px] shadow-sm mb-10 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> 出发城市
            </label>
            <div className="relative">
              <select 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-4 rounded-2xl border-none bg-white/70 shadow-sm focus:ring-4 focus:ring-emerald-500/20 outline-none text-slate-700 font-medium appearance-none cursor-pointer"
              >
                {Object.entries(CITIES).map(([group, cities]) => (
                  <optgroup key={group} label={group}>
                    {cities.map(city => (
                      <option key={`origin-${city.code}`} value={city.code}>{city.name} ({city.code})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> 目的城市
            </label>
            <div className="relative">
              <select 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-4 rounded-2xl border-none bg-white/70 shadow-sm focus:ring-4 focus:ring-rose-500/20 outline-none text-slate-700 font-medium appearance-none cursor-pointer"
              >
                {Object.entries(CITIES).map(([group, cities]) => (
                  <optgroup key={group} label={group}>
                    {cities.map(city => (
                      <option key={`dest-${city.code}`} value={city.code}>{city.name} ({city.code})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end border-t border-slate-200/50 pt-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> 出发日期
            </label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full p-4 rounded-2xl border-none bg-white/70 shadow-sm focus:ring-4 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium transition-all"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" /> 返程日期
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full p-4 rounded-2xl border-none bg-white/70 shadow-sm focus:ring-4 focus:ring-purple-500/20 outline-none text-slate-700 font-medium transition-all"
            />
          </div>

          <div className="w-full md:w-1/3">
            <button
              onClick={handleSearch}
              disabled={loading || !departDate || !returnDate}
              className={`w-full py-4 ${loading ? 'bg-indigo-300' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02]'} text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loading ? (
                <span className="animate-spin text-white">⏳</span>
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "连线各航司数据..." : "查询实时底价"}
            </button>
          </div>
        </div>
      </div>

      {showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ================= 航班结果 ================= */}
          <div className="glass-panel p-6 md:p-8 rounded-[32px] relative overflow-hidden group h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-400/20" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                  <Plane className="w-6 h-6" />
                </div>
                精选往返机票
              </h2>
              <div className="text-xs text-slate-400">已更新 {lastUpdated}</div>
            </div>

            {/* 航班筛选区 */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="relative">
                <select 
                  value={flightAirline}
                  onChange={(e) => setFlightAirline(e.target.value)}
                  className="pl-8 pr-8 py-2 rounded-full bg-white/60 text-sm font-medium text-slate-600 border border-transparent hover:border-blue-200 outline-none appearance-none cursor-pointer"
                >
                  {airlines.map(al => <option key={al} value={al}>{al}</option>)}
                </select>
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex bg-white/60 p-1 rounded-full text-sm font-medium">
                <button 
                  onClick={() => setFlightSort('recommended')}
                  className={`px-4 py-1.5 rounded-full transition-all ${flightSort === 'recommended' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >推荐</button>
                <button 
                  onClick={() => setFlightSort(flightSort === 'price_asc' ? 'price_desc' : 'price_asc')}
                  className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1 ${flightSort.includes('price') ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  价格 <ArrowDownUp className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {displayedFlights.length > 0 ? displayedFlights.map((flight, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl bg-white/80 hover:bg-white transition-all cursor-pointer shadow-sm border border-transparent hover:border-blue-200">
                  
                  {/* 左侧：航班信息 (去程 + 返程) */}
                  <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                    <div className="flex flex-col gap-4">
                      
                      {/* 去程 */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 text-center text-[10px] font-bold text-blue-600 bg-blue-100 py-1 rounded">去程</div>
                        <div className="w-20">
                          <span className="font-bold text-slate-800 text-lg">{flight.time}</span>
                          <div className="text-[10px] text-slate-500">{flight.departDateStr}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">{flight.airline}</span>
                            <span className="text-xs text-slate-500">{flight.flight_number}</span>
                            {flight.isLCC && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded border border-orange-300 text-orange-500 font-semibold">廉价航空</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 返程 */}
                      {flight.type === "往返" && (
                        <div className="flex items-center gap-4">
                          <div className="w-10 text-center text-[10px] font-bold text-indigo-600 bg-indigo-100 py-1 rounded">返程</div>
                          <div className="w-20">
                            <span className="font-bold text-slate-800 text-lg">{flight.returnTime}</span>
                            <div className="text-[10px] text-slate-500">{flight.returnDateStr}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">{flight.airline}</span>
                              <span className="text-xs text-slate-500">{flight.flight_number.replace(/\d+$/, (m) => parseInt(m) + 1)}</span>
                              {flight.isLCC && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded border border-orange-300 text-orange-500 font-semibold">廉价航空</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  {/* 右侧：价格 (经济舱 + 头等舱) */}
                  <div className="flex flex-row md:flex-col gap-4 md:gap-2 justify-end items-end w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 pl-0 md:pl-6 border-l-0 md:border-l">
                    
                    {/* 经济舱 */}
                    <div className="flex flex-col items-end text-right">
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">经济舱</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-orange-500">￥</span>
                        <span className="text-2xl font-black text-orange-500 leading-none">{flight.ecoPrice}</span>
                      </div>
                    </div>

                    {/* 头等/公务舱 */}
                    <div className="flex flex-col items-end text-right opacity-60 hover:opacity-100 transition-opacity">
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">头等/公务舱</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-slate-600">￥</span>
                        <span className="text-lg font-bold text-slate-600 leading-none">{flight.firstPrice}</span>
                      </div>
                    </div>

                  </div>

                </div>
              )) : (
                <div className="py-8 text-center text-slate-500 font-medium bg-white/40 rounded-2xl">
                  没有找到符合条件的航班
                </div>
              )}
            </div>
            
            {filteredFlights.length > 3 && (
              <button 
                onClick={() => setShowAllFlights(!showAllFlights)}
                className="w-full mt-6 py-3 rounded-xl bg-blue-50/80 text-blue-600 font-bold hover:bg-blue-100 transition-colors flex justify-center items-center gap-2"
              >
                {showAllFlights ? (
                  <>收起列表 <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>查看全部 {filteredFlights.length} 个航班 <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>

          {/* ================= 酒店结果 ================= */}
          <div className="glass-panel p-6 md:p-8 rounded-[32px] relative overflow-hidden group h-fit">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-400/20" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                  <Building className="w-6 h-6" />
                </div>
                高性价比酒店
              </h2>
               <div className="text-xs text-slate-400">已更新 {lastUpdated}</div>
            </div>

            {/* 酒店筛选区 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {hotelCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setHotelCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    hotelCategory === cat 
                      ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20' 
                      : 'bg-white/60 text-slate-500 hover:bg-white/90'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {displayedHotels.length > 0 ? displayedHotels.map((hotel, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/70 hover:bg-white transition-all cursor-pointer shadow-sm border border-transparent hover:border-purple-100">
                  <div>
                    <div className="font-bold text-slate-800 mb-1 text-lg line-clamp-1">{hotel.name}</div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <span className="text-amber-500 font-bold">★ {hotel.rating}</span>
                      <span>· {hotel.desc}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4 flex flex-col justify-end items-end">
                    <div className="text-2xl font-black text-purple-600">{hotel.price}<span className="text-sm text-slate-400 font-semibold">/晚</span></div>
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-block mt-1 ${
                      hotel.category === '豪华/五星' ? 'bg-amber-100 text-amber-700' :
                      hotel.category === '商旅/四星' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-50 text-purple-500'
                    }`}>
                      {hotel.tag}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-500 font-medium bg-white/40 rounded-2xl">
                  没有找到符合条件的酒店
                </div>
              )}
            </div>
             
            {filteredHotels.length > 3 && (
              <button 
                onClick={() => setShowAllHotels(!showAllHotels)}
                className="w-full mt-6 py-3 rounded-xl bg-purple-50/80 text-purple-600 font-bold hover:bg-purple-100 transition-colors flex justify-center items-center gap-2"
              >
                {showAllHotels ? (
                  <>收起列表 <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>查看全部 {filteredHotels.length} 家酒店 <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-[32px] flex flex-col items-center justify-center text-center opacity-70">
          <div className="bg-slate-100 p-6 rounded-full mb-6">
            <Search className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">等待查询</h3>
          <p className="text-slate-500 font-medium max-w-sm">
            选择出发城市、目的城市与行程日期，系统将自动拉取真实底价。
          </p>
        </div>
      )}
    </div>
  );
}
