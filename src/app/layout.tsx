import type { Metadata } from "next";
import "./styles.css";
import Link from "next/link";
import { Home, Plane, Compass, Heart, Settings, Map, Sparkles } from "lucide-react";
import PriceComparator from "@/components/PriceComparator";

export const metadata: Metadata = {
  title: "WanderAI | iOS 26 风格",
  description: "全玻璃拟态旅行管家",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window._AMapSecurityConfig = { serviceHost: typeof window !== 'undefined' ? window.location.origin + '/_AMapService' : '' };`,
          }}
        />
      </head>
      <body className={`font-sans bg-[#F2F2F7] flex h-screen overflow-hidden relative print:h-auto print:overflow-visible print:block`}>
        {/* 全局毛玻璃背景动效球 */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none print:hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/40 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-300/40 blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-pink-300/30 blur-[90px]" />
        </div>

        {/* 侧边栏 (Desktop) */}
        <aside className="hidden md:flex flex-col w-[280px] glass-panel h-[calc(100vh-32px)] m-4 rounded-[40px] z-10 print:hidden">
          <div className="p-8 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">WanderAI</span>
          </div>
          
          <nav className="flex-1 px-5 space-y-3 mt-4">
            <Link href="/" className="flex items-center gap-3 px-5 py-3.5 rounded-[20px] bg-white/60 shadow-sm text-blue-600 font-bold border border-white/60 transition-all hover:scale-[1.02]">
              <Home className="w-5 h-5" /> 工作台
            </Link>
            <Link href="/planner" className="flex items-center gap-3 px-5 py-3.5 rounded-[20px] text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all font-semibold hover:scale-[1.02]">
              <Map className="w-5 h-5" /> 新建规划
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-5 py-3.5 rounded-[20px] text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all font-semibold hover:scale-[1.02]">
              <Compass className="w-5 h-5" /> 发现灵感
            </Link>
            <Link href="/prices" className="flex items-center gap-3 px-5 py-3.5 rounded-[20px] text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all font-semibold hover:scale-[1.02]">
              <Sparkles className="w-5 h-5" /> 查询价格
            </Link>
            <Link href="/saved" className="flex items-center gap-3 px-5 py-3.5 rounded-[20px] text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all font-semibold hover:scale-[1.02]">
              <Heart className="w-5 h-5" /> 我的行程
            </Link>
          </nav>

          <div className="p-5">
            <button className="flex items-center gap-3 px-5 py-4 w-full rounded-[20px] text-slate-600 hover:bg-white/50 transition-all font-semibold border border-transparent hover:border-white/50">
              <Settings className="w-5 h-5" /> 设置
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 h-full overflow-y-auto relative z-10 pb-24 md:pb-0 scroll-smooth no-scrollbar print:overflow-visible print:h-auto print:block">
          {children}
        </main>

        {/* 底部导航 (Mobile) - 毛玻璃漂浮 */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 glass-panel rounded-[32px] flex justify-around p-4 z-50 print:hidden">
          <Link href="/" className="flex flex-col items-center text-blue-600">
            <div className="bg-blue-100/50 p-2 rounded-xl mb-1"><Home className="w-6 h-6" /></div>
            <span className="text-[10px] font-bold">首页</span>
          </Link>
          <Link href="/planner" className="flex flex-col items-center text-slate-500 hover:text-slate-900 transition-colors">
            <div className="p-2 rounded-xl mb-1"><Map className="w-6 h-6" /></div>
            <span className="text-[10px] font-bold">规划</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center text-slate-500 hover:text-slate-900 transition-colors">
            <div className="p-2 rounded-xl mb-1"><Compass className="w-6 h-6" /></div>
            <span className="text-[10px] font-bold">发现</span>
          </Link>
          <Link href="/prices" className="flex flex-col items-center text-slate-500 hover:text-slate-900 transition-colors">
            <div className="p-2 rounded-xl mb-1"><Sparkles className="w-6 h-6" /></div>
            <span className="text-[10px] font-bold">比价</span>
          </Link>
          <Link href="/saved" className="flex flex-col items-center text-slate-500 hover:text-slate-900 transition-colors">
            <div className="p-2 rounded-xl mb-1"><Heart className="w-6 h-6" /></div>
            <span className="text-[10px] font-bold">行程</span>
          </Link>
        </nav>

        <PriceComparator />
      </body>
    </html>
  );
}