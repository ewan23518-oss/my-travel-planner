'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Map, Calendar, Trash2, ArrowRight, PlaneTakeoff, ExternalLink } from 'lucide-react';
import { TripResult } from '@/lib/types';
import { useTravelStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function SavedPage() {
  const router = useRouter();
  const { tripResult } = useTravelStore();
  const [savedTrips, setSavedTrips] = useState<TripResult[]>([]);

  useEffect(() => {
    // 真实项目中这里应该从 localStorage 或后端 API 获取
    // 为了演示，如果 store 里有刚生成的行程，我们就把它当作历史记录展示，并模拟一条旧数据
    const mockHistory: TripResult[] = [];
    
    if (tripResult) {
      mockHistory.push(tripResult);
    }
    
    // 添加一条模拟的历史数据
    mockHistory.push({
      id: 'mock-old-trip',
      destination: '法国巴黎',
      days: 5,
      overview: '巴黎5日浪漫之旅，打卡卢浮宫与埃菲尔铁塔。',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3天前
      budgetBreakdown: { total: 15000 } as any,
      dailyPlans: []
    });

    setSavedTrips(mockHistory);
  }, [tripResult]);

  const handleDelete = (id: string) => {
    setSavedTrips(prev => prev.filter(t => t.id !== id));
    // 实际项目中需要一并删除 localStorage
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">我的行程</h1>
            <p className="mt-2 text-slate-500">查看和管理你生成过的所有旅行攻略</p>
          </div>
          <Link href="/planner" className="hidden sm:flex bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors items-center gap-2 shadow-sm">
            <PlaneTakeoff className="w-4 h-4" /> 新建规划
          </Link>
        </div>

        {savedTrips.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Map className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">暂无行程记录</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">你还没有生成过任何旅行计划。快去告诉 WanderAI 你想去哪里吧！</p>
            <Link href="/planner" className="inline-flex bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
              去生成我的第一份攻略
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {savedTrips.map((trip, idx) => (
              <motion.div 
                key={trip.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
              >
                <div className="flex items-start sm:items-center gap-5">
                  <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Map className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                      {trip.destination} 
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{trip.days}天</span>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(trip.createdAt).toLocaleDateString()}</span>
                      <span>预估花费: ¥{trip.budgetBreakdown.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:w-auto w-full border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                  <button 
                    onClick={() => handleDelete(trip.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (trip.id === tripResult?.id) {
                        router.push(`/result/${trip.id}`);
                      } else {
                        alert('真实项目中这里将根据ID从数据库拉取详情并跳转');
                      }
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
                  >
                    查看详情 <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}