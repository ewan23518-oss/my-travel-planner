'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Wallet, Users, Sparkles, Loader2, Navigation, Coffee, Camera, ShoppingBag, Palmtree, Baby, Footprints } from 'lucide-react';
import { useTravelStore } from '../../lib/store';
import { TravelStyle, BudgetLevel } from '../../lib/types';

const styles: { id: TravelStyle; label: string; icon: any }[] = [
  { id: 'relaxed', label: '休闲放松', icon: Palmtree },
  { id: 'culture', label: '历史文化', icon: Camera },
  { id: 'shopping', label: '疯狂购物', icon: ShoppingBag },
  { id: 'food', label: '美食探索', icon: Coffee },
  { id: 'family', label: '亲子游玩', icon: Baby },
  { id: 'citywalk', label: 'CityWalk', icon: Footprints },
];

const budgets: { id: BudgetLevel; label: string; desc: string }[] = [
  { id: 'economy', label: '经济穷游', desc: '青旅/快捷，公交为主' },
  { id: 'standard', label: '舒适标准', desc: '星级酒店，打车+地铁' },
  { id: 'luxury', label: '奢华享受', desc: '豪华五星，专车接送' },
];

export default function PlannerPage() {
  const router = useRouter();
  const { tripInput, setTripInput, setIsGenerating, isGenerating } = useTravelStore();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripInput.destination.trim()) {
      setError('请输入目的地');
      return;
    }
    
    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/trips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripInput),
      });
      
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`请求异常 (HTTP ${response.status}): 服务器未返回标准格式，可能请求超时或网络波动。`);
      }
      
      if (response.ok) {
        useTravelStore.getState().setTripResult(data.data);
        router.push(`/result/${data.data.id}`);
      } else {
        throw new Error(data.error || '生成失败，请重试');
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请检查网络连接');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm"
          >
            定制你的专属行程
          </motion.h1>
          <p className="mt-4 text-lg text-slate-600/80 font-medium">告诉我们你的想法，WanderAI 为你安排好一切。</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel rounded-[40px] p-6 md:p-10 shadow-xl shadow-blue-500/5 relative overflow-hidden"
        >
          {/* 内部高光效果 */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                  <Navigation className="w-4 h-4 text-blue-500" /> 出发地
                </label>
                <input 
                  type="text" 
                  value={tripInput.departure}
                  onChange={(e) => setTripInput({ departure: e.target.value })}
                  placeholder="例如：北京" 
                  className="w-full px-5 py-4 rounded-[20px] bg-white/40 border border-white/60 focus:bg-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-md font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                  <MapPin className="w-4 h-4 text-blue-500" /> 目的地 *
                </label>
                <input 
                  type="text" 
                  required
                  value={tripInput.destination}
                  onChange={(e) => setTripInput({ destination: e.target.value })}
                  placeholder="例如：东京, 巴黎" 
                  className="w-full px-5 py-4 rounded-[20px] bg-white/40 border border-white/60 focus:bg-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-md font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                  <Calendar className="w-4 h-4 text-blue-500" /> 出发日期
                </label>
                <input 
                  type="date" 
                  required
                  value={tripInput.startDate}
                  onChange={(e) => setTripInput({ startDate: e.target.value })}
                  className="w-full px-5 py-4 rounded-[20px] bg-white/40 border border-white/60 focus:bg-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-md font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                  <Calendar className="w-4 h-4 text-blue-500" /> 游玩天数
                </label>
                <div className="flex items-center bg-white/40 border border-white/60 rounded-[20px] overflow-hidden p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-md">
                  <button type="button" onClick={() => setTripInput({ days: Math.max(1, tripInput.days - 1) })} className="w-12 h-12 flex items-center justify-center bg-white/50 hover:bg-white/80 rounded-2xl text-slate-600 font-bold text-xl transition-all shadow-sm">-</button>
                  <input type="number" readOnly value={tripInput.days} className="flex-1 text-center py-3 font-bold text-lg bg-transparent outline-none text-slate-800" />
                  <button type="button" onClick={() => setTripInput({ days: Math.min(30, tripInput.days + 1) })} className="w-12 h-12 flex items-center justify-center bg-white/50 hover:bg-white/80 rounded-2xl text-slate-600 font-bold text-xl transition-all shadow-sm">+</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                  <Users className="w-4 h-4 text-blue-500" /> 出行人数
                </label>
                <div className="flex items-center bg-white/40 border border-white/60 rounded-[20px] overflow-hidden p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-md">
                  <button type="button" onClick={() => setTripInput({ companions: Math.max(1, tripInput.companions - 1) })} className="w-12 h-12 flex items-center justify-center bg-white/50 hover:bg-white/80 rounded-2xl text-slate-600 font-bold text-xl transition-all shadow-sm">-</button>
                  <input type="number" readOnly value={tripInput.companions} className="flex-1 text-center py-3 font-bold text-lg bg-transparent outline-none text-slate-800" />
                  <button type="button" onClick={() => setTripInput({ companions: Math.min(20, tripInput.companions + 1) })} className="w-12 h-12 flex items-center justify-center bg-white/50 hover:bg-white/80 rounded-2xl text-slate-600 font-bold text-xl transition-all shadow-sm">+</button>
                </div>
              </div>
            </div>

            {/* 预算选择 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                <Wallet className="w-4 h-4 text-blue-500" /> 预算偏好
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {budgets.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => setTripInput({ budget: b.id })}
                    className={`cursor-pointer p-5 rounded-[24px] transition-all backdrop-blur-md relative overflow-hidden ${
                      tripInput.budget === b.id 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400' 
                      : 'bg-white/40 hover:bg-white/60 border border-white/60 text-slate-700'
                    }`}
                  >
                    {tripInput.budget === b.id && <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />}
                    <div className="font-bold text-lg relative z-10">{b.label}</div>
                    <div className={`text-sm mt-1.5 relative z-10 font-medium ${tripInput.budget === b.id ? 'text-blue-100' : 'text-slate-500'}`}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700/80">
                <Sparkles className="w-4 h-4 text-blue-500" /> 旅行风格
              </label>
              <div className="flex flex-wrap gap-3">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTripInput({ style: s.id })}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all font-bold backdrop-blur-md ${
                      tripInput.style === s.id 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-500/50' 
                      : 'bg-white/40 hover:bg-white/60 text-slate-700 border border-white/60 shadow-sm'
                    }`}
                  >
                    <s.icon className={`w-4 h-4 ${tripInput.style === s.id ? 'text-blue-100' : 'text-blue-500'}`} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 附加要求 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700/80">
                特殊需求 (选填)
              </label>
              <textarea 
                rows={3}
                value={tripInput.extraNotes}
                onChange={(e) => setTripInput({ extraNotes: e.target.value })}
                placeholder="例如：不吃海鲜，必须要去环球影城，安排一天购物..." 
                className="w-full px-5 py-4 rounded-[24px] bg-white/40 border border-white/60 focus:bg-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-md font-medium text-slate-800 placeholder:text-slate-400 resize-none"
              />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-100/80 backdrop-blur-md border border-red-200 text-red-600 rounded-[20px] text-sm font-bold flex items-center justify-center">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xl py-5 rounded-[24px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30"
            >
              <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
              {isGenerating ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> AI 正在深度思考中...</>
              ) : (
                <><Sparkles className="w-6 h-6" /> 立即生成专属规划</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}