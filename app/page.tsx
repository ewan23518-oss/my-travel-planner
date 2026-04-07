'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Map, Compass, ArrowRight, Clock, Plus, CloudSun, BatteryMedium } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">早上好 👋</h1>
          <p className="text-slate-500 mt-2 font-medium">今天想去哪里探索？</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/50 backdrop-blur-md shadow-sm border border-white/60 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* iOS Widget Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[160px]">
        
        {/* Main Action Widget (2x2 equivalent) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-2 row-span-2 relative rounded-[36px] overflow-hidden shadow-lg group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay object-cover" alt="bg" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4">
                <Map className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">AI 智能规划</h2>
              <p className="text-blue-100 font-medium">一键生成你的专属旅行计划</p>
            </div>
            <Link href="/planner" className="inline-flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-4 rounded-2xl font-bold transition-all border border-white/20 group-hover:scale-[1.02]">
              <span>立即开始创作</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Explore Widget (1x2) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="col-span-2 md:col-span-1 row-span-2 relative rounded-[36px] overflow-hidden shadow-lg group">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
           <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
             <h3 className="text-xl font-bold mb-1">当季热门</h3>
             <p className="text-sm text-white/80 mb-5 line-clamp-2">探索大家都在去的小众秘境。</p>
             <Link href="/explore" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 rounded-2xl text-center text-sm font-bold border border-white/20 flex items-center justify-center gap-2 transition-colors">
               去看看 <ArrowRight className="w-4 h-4"/>
             </Link>
           </div>
        </motion.div>

        {/* Weather/Info Widget (1x1) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="col-span-1 row-span-1 bg-gradient-to-br from-sky-400 to-blue-500 rounded-[36px] p-6 shadow-lg text-white flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <CloudSun className="w-8 h-8 text-white/90" />
            <span className="text-3xl font-bold">24°</span>
          </div>
          <div>
            <h4 className="font-semibold text-white/90 text-lg">东京</h4>
            <p className="text-sm text-white/70">适合出游</p>
          </div>
        </motion.div>

        {/* System Status Widget (1x1) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="col-span-1 row-span-1 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[36px] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start text-slate-700">
            <BatteryMedium className="w-8 h-8 text-green-500" />
            <span className="text-sm font-bold text-slate-400">系统</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Wander Core</h4>
            <p className="text-sm font-semibold text-green-600">在线运行中</p>
          </div>
        </motion.div>

        {/* Recent Trips Widget (Wide) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-2 md:col-span-4 row-span-1 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[36px] p-6 shadow-sm flex items-center justify-between hover:bg-white/70 transition-colors cursor-pointer">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[24px] bg-slate-100/80 border border-white flex items-center justify-center text-slate-400 shadow-inner">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">暂无最近行程</h4>
              <p className="text-sm text-slate-500 font-medium">准备好出发了吗？</p>
            </div>
          </div>
          <Link href="/planner" className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-[20px] font-bold hover:bg-slate-800 transition-colors shadow-md hover:scale-[1.02]">
            <Plus className="w-5 h-5" /> 新建规划
          </Link>
        </motion.div>

      </div>
    </div>
  );
}