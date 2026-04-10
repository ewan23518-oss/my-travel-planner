'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Map, Compass, ArrowRight, Clock, Plus, CloudSun, BatteryMedium, Plane } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-white/40 backdrop-blur-[40px] border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">早上好 👋</h1>
          <p className="text-slate-600/80 mt-2 font-bold">今天想去哪里探索？</p>
        </div>
        <div className="w-16 h-16 rounded-[24px] bg-white/60 backdrop-blur-md shadow-inner border border-white/80 flex items-center justify-center overflow-hidden p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover rounded-[20px]" />
        </div>
      </motion.div>

      {/* iOS Widget Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[180px]">
        
        {/* Main Action Widget (2x2 equivalent) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
          className="col-span-2 row-span-2 relative rounded-[40px] overflow-hidden shadow-xl shadow-blue-500/20 group border border-white/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay object-cover transition-transform duration-1000 group-hover:scale-110" alt="bg" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[20px] flex items-center justify-center text-white mb-5 shadow-inner border border-white/30">
                <Plane className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md tracking-tight">AI 智能规划</h2>
              <p className="text-blue-50 font-bold text-lg drop-shadow">一键生成你的专属旅行计划</p>
            </div>
            <Link href="/planner" className="inline-flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white px-6 py-5 rounded-[24px] font-extrabold text-lg transition-all border border-white/30 group-hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <span>立即开始创作</span>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Explore Widget (1x2) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} 
          className="col-span-2 md:col-span-1 row-span-2 relative rounded-[40px] overflow-hidden shadow-lg group border border-white/60"
        >
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
             <div className="bg-white/20 backdrop-blur-md self-start px-3 py-1 rounded-full text-xs font-bold mb-auto border border-white/30">
               Featured
             </div>
             <h3 className="text-2xl font-extrabold mb-1 drop-shadow-md">当季热门</h3>
             <p className="text-sm text-white/90 mb-5 line-clamp-2 font-medium drop-shadow">探索大家都在去的小众秘境。</p>
             <Link href="/explore" className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-xl py-4 rounded-[20px] text-center text-sm font-extrabold border border-white/30 flex items-center justify-center gap-2 transition-colors shadow-inner">
               去看看 <ArrowRight className="w-4 h-4"/>
             </Link>
           </div>
        </motion.div>

        {/* Weather/Info Widget (1x1) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} 
          className="col-span-1 row-span-1 relative rounded-[40px] p-6 shadow-lg text-white flex flex-col justify-between hover:scale-[1.02] transition-transform overflow-hidden border border-white/30 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/30 transition-colors"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <CloudSun className="w-9 h-9 text-white drop-shadow-sm" />
            <span className="text-4xl font-extrabold drop-shadow-md tracking-tighter">24°</span>
          </div>
          <div className="relative z-10">
            <h4 className="font-extrabold text-white text-xl drop-shadow-sm">东京</h4>
            <p className="text-sm text-blue-50 font-semibold drop-shadow-sm">适合出游</p>
          </div>
        </motion.div>

        {/* System Status Widget (1x1) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} 
          className="col-span-1 row-span-1 bg-white/40 backdrop-blur-[40px] border border-white/60 rounded-[40px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-start text-slate-700">
            <div className="p-2.5 bg-green-100/50 rounded-[16px]">
              <BatteryMedium className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white/50 px-3 py-1 rounded-full">System</span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-lg">Wander Core</h4>
            <p className="text-sm font-bold text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              在线运行中
            </p>
          </div>
        </motion.div>

        {/* Recent Trips Widget (Wide) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
          className="col-span-2 md:col-span-4 row-span-1 bg-white/40 backdrop-blur-[40px] border border-white/60 rounded-[40px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between hover:bg-white/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[24px] bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-slate-400 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] group-hover:scale-105 transition-transform">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-2xl tracking-tight mb-1">暂无最近行程</h4>
              <p className="text-base text-slate-500 font-bold">准备好出发了吗？</p>
            </div>
          </div>
          <Link href="/planner" className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-5 rounded-[28px] font-extrabold text-lg hover:from-slate-700 hover:to-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:scale-[1.02]">
            <Plus className="w-6 h-6" /> 
            <span>新建规划</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}