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
      // 调用生成接口
      const response = await fetch('/api/trips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripInput),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 保存结果并跳转到结果页
        useTravelStore.getState().setTripResult(data.data);
        router.push(`/result/${data.data.id}`);
      } else {
        setError(data.error || '生成失败，请重试');
        setIsGenerating(false);
      }
    } catch (err) {
      setError('网络错误，请检查网络连接');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            定制你的专属行程
          </motion.h1>
          <p className="mt-4 text-lg text-slate-500">告诉我们你的想法，WanderAI 为你安排好一切。</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Navigation className="w-4 h-4 text-primary-500" /> 出发地
                </label>
                <input 
                  type="text" 
                  value={tripInput.departure}
                  onChange={(e) => setTripInput({ departure: e.target.value })}
                  placeholder="例如：北京" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 text-primary-500" /> 目的地 *
                </label>
                <input 
                  type="text" 
                  required
                  value={tripInput.destination}
                  onChange={(e) => setTripInput({ destination: e.target.value })}
                  placeholder="例如：东京, 巴黎" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 text-primary-500" /> 出发日期
                </label>
                <input 
                  type="date" 
                  required
                  value={tripInput.startDate}
                  onChange={(e) => setTripInput({ startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 text-primary-500" /> 游玩天数
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setTripInput({ days: Math.max(1, tripInput.days - 1) })} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">-</button>
                  <input type="number" readOnly value={tripInput.days} className="w-full text-center py-3 font-medium outline-none" />
                  <button type="button" onClick={() => setTripInput({ days: Math.min(30, tripInput.days + 1) })} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">+</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users className="w-4 h-4 text-primary-500" /> 出行人数
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setTripInput({ companions: Math.max(1, tripInput.companions - 1) })} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">-</button>
                  <input type="number" readOnly value={tripInput.companions} className="w-full text-center py-3 font-medium outline-none" />
                  <button type="button" onClick={() => setTripInput({ companions: Math.min(20, tripInput.companions + 1) })} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">+</button>
                </div>
              </div>
            </div>

            {/* 预算选择 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Wallet className="w-4 h-4 text-primary-500" /> 预算偏好
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {budgets.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => setTripInput({ budget: b.id })}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${tripInput.budget === b.id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className={`font-semibold ${tripInput.budget === b.id ? 'text-primary-700' : 'text-slate-700'}`}>{b.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 text-primary-500" /> 旅行风格
              </label>
              <div className="flex flex-wrap gap-3">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTripInput({ style: s.id })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                      tripInput.style === s.id 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 附加要求 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                特殊需求 (选填)
              </label>
              <textarea 
                rows={3}
                value={tripInput.extraNotes}
                onChange={(e) => setTripInput({ extraNotes: e.target.value })}
                placeholder="例如：不吃海鲜，必须要去环球影城，安排一天购物..." 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg py-4 rounded-xl disabled:bg-primary-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
            >
              {isGenerating ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> AI 正在深度规划中...</>
              ) : (
                <><Sparkles className="w-6 h-6" /> 立即生成专属攻略</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
