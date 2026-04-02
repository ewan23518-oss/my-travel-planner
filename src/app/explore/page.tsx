'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Clock, Wallet, Star, ArrowRight, Compass, Camera, Baby, Palmtree } from 'lucide-react';

const categories = [
  { id: 'hot', label: '当季热门', icon: Star },
  { id: 'sea', label: '海滨度假', icon: Palmtree },
  { id: 'family', label: '亲子时光', icon: Baby },
  { id: 'photo', label: '摄影打卡', icon: Camera },
];

const destinations = [
  {
    id: 1,
    name: '日本 · 京都',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    tags: ['历史文化', '摄影', '美食'],
    days: '5-7',
    budget: '¥6,000 - 10,000',
    desc: '穿梭在古色古香的千本鸟居，品味正宗的怀石料理，感受千年古都的宁静与禅意。',
  },
  {
    id: 2,
    name: '印度尼西亚 · 巴厘岛',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    tags: ['海岛休闲', '蜜月', '冲浪'],
    days: '4-6',
    budget: '¥4,000 - 8,000',
    desc: '在绝美的悬崖海景旁醒来，体验世界级的冲浪胜地和独特的梯田风光。',
  },
  {
    id: 3,
    name: '中国 · 新疆伊犁',
    image: 'https://images.unsplash.com/photo-1596068284587-84da4cb94132?q=80&w=800&auto=format&fit=crop',
    tags: ['自然风光', '自驾', '小众'],
    days: '7-10',
    budget: '¥5,000 - 9,000',
    desc: '塞外江南，雪山与草原交织的绝美画卷，适合一场说走就走的公路旅行。',
  },
  {
    id: 4,
    name: '法国 · 巴黎',
    image: 'https://images.unsplash.com/photo-1502602898657-3e907a5ea82c?q=80&w=800&auto=format&fit=crop',
    tags: ['浪漫', '艺术', '购物'],
    days: '6-8',
    budget: '¥12,000 - 20,000',
    desc: '在塞纳河畔漫步，仰望埃菲尔铁塔的日落，沉浸在卢浮宫的艺术海洋中。',
  },
  {
    id: 5,
    name: '泰国 · 清迈',
    image: 'https://images.unsplash.com/photo-1513622470522-26c311545625?q=80&w=800&auto=format&fit=crop',
    tags: ['慢生活', '古城', '高性价比'],
    days: '4-5',
    budget: '¥3,000 - 5,000',
    desc: '泰北玫瑰，物价感人的数字游民天堂。在古城里找一家咖啡馆呆上一个下午。',
  },
  {
    id: 6,
    name: '瑞士 · 少女峰',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop',
    tags: ['雪山', '徒步', '极致风光'],
    days: '5-7',
    budget: '¥15,000 - 25,000',
    desc: '乘坐齿轮火车登顶欧洲之巅，在童话般的阿尔卑斯小镇中呼吸最纯净的空气。',
  }
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-2xl mb-6 text-primary-600">
            <Compass className="w-8 h-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            探索世界，寻找灵感
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-500">
            不知道去哪儿？从我们为你精选的全球绝美目的地中挑选你的下一站。
          </motion.p>
        </div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
          {categories.map((cat, idx) => (
            <button key={cat.id} className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${idx === 0 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <cat.icon className="w-4 h-4" /> {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest, idx) => (
            <motion.div 
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-60 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  {dest.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center justify-between">
                  {dest.name}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {dest.desc}
                </p>
                
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Clock className="w-4 h-4 text-slate-400" /> 建议游玩：<span className="font-semibold text-slate-900">{dest.days} 天</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Wallet className="w-4 h-4 text-slate-400" /> 参考预算：<span className="font-semibold text-slate-900">{dest.budget}</span>
                  </div>
                </div>

                <Link href="/planner" className="w-full bg-slate-50 hover:bg-primary-50 text-slate-900 hover:text-primary-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-100 hover:border-primary-100">
                  定制此路线 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}