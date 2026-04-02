'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Map as MapIcon, Utensils, Bed, Wallet, ArrowLeft, Download, CheckCircle2, Plane, Sparkles, Coffee, Share, Link2, Image as ImageIcon, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useTravelStore } from '@/lib/store';
import dynamic from 'next/dynamic';

const MapRoute = dynamic(() => import('@/components/MapRoute'), { ssr: false });

// 简单的城市映射表，用于转换中文城市到 IATA 代码
const getCityCode = (cityName: string) => {
  const map: Record<string, string> = {
    '北京': 'BJS', '上海': 'SHA', '广州': 'CAN', '深圳': 'SZX', '成都': 'CTU',
    '杭州': 'HGH', '重庆': 'CKG', '香港': 'HKG', '东京': 'TYO', '首尔': 'SEL',
    '曼谷': 'BKK', '新加坡': 'SIN', '巴黎': 'PAR', '伦敦': 'LON', '纽约': 'NYC'
  };
  return map[cityName] || 'SHA'; // 默认回退到上海
};

export default function ResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { tripResult } = useTravelStore();
  const [activeDay, setActiveDay] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [livePrices, setLivePrices] = useState<{flight: any, hotel: any} | null>(null);
  const [trafficInfo, setTrafficInfo] = useState<any>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!tripResult) return;
    const fetchTraffic = async () => {
      try {
        const city = tripResult.destination;
        const to = tripResult.dailyPlans[0]?.activities[0]?.location || `${city}市中心`;
        const from = `${city}机场`;
        
        let res = await fetch(`http://localhost:3030/api/traffic?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&city=${encodeURIComponent(city)}`);
        let data = await res.json();
        if (data.status === 'success') {
          setTrafficInfo(data.trafficDetails);
        } else {
          res = await fetch(`http://localhost:3030/api/traffic?from=${encodeURIComponent(city + '站')}&to=${encodeURIComponent(to)}&city=${encodeURIComponent(city)}`);
          data = await res.json();
          if (data.status === 'success') {
            setTrafficInfo(data.trafficDetails);
          }
        }
      } catch (err) {
        console.error("Traffic API Error:", err);
      }
    };
    fetchTraffic();
  }, [tripResult]);

  useEffect(() => {
    if (!tripResult || tripResult.id !== params.id) {
      router.push('/planner');
      return;
    }

    // 调用 Travelpayouts API 获取机酒推荐
    const fetchPrices = async () => {
      try {
        const destCode = getCityCode(tripResult.destination);
        // 使用一个大概的日期，这里假定是下周的今天作为出发日，+ tripResult.days 作为返程日
        const today = new Date();
        const depart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const returnD = new Date(today.getTime() + (7 + tripResult.days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const res = await fetch(`/api/prices?origin=BJS&destination=${destCode}&departDate=${depart}&returnDate=${returnD}`);
        const data = await res.json();
        
        if (data.success && data.flights.length > 0 && data.hotels.length > 0) {
          // 挑选最推荐/便宜的作为智能推荐展示
          setLivePrices({
            flight: data.flights[0], // 取第一个（通常我们 API 里第一个是最便宜的/推荐的）
            hotel: data.hotels[2] || data.hotels[0] // 推荐一个商旅或者默认酒店
          });
        }
      } catch (err) {
        console.error("Failed to fetch live prices", err);
      }
    };

    fetchPrices();
  }, [tripResult, params.id, router]);

  if (!tripResult) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attraction': return <MapIcon className="w-5 h-5 text-blue-500" />;
      case 'dining': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'hotel': return <Bed className="w-5 h-5 text-indigo-500" />;
      case 'transit': return <Clock className="w-5 h-5 text-slate-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setShowShareMenu(false);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('链接已复制到剪贴板，快去分享给好友吧！');
    setShowShareMenu(false);
  };

  const handleGeneratePoster = async () => {
    setIsGeneratingPoster(true);
    setShowShareMenu(false);
    
    // 等待 DOM 渲染
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const posterElement = document.getElementById('poster-template');
    if (!posterElement) return;

    try {
      const canvas = await html2canvas(posterElement, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#f8fafc',
      });
      const url = canvas.toDataURL('image/png');
      setPosterUrl(url);
    } catch (err) {
      console.error('Poster generation failed:', err);
      alert('生成海报失败，请稍后再试');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const currentDayPlan = tripResult.dailyPlans.find(p => p.day === activeDay);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between print:hidden">
          <button 
            onClick={() => router.push('/planner')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium glass-button px-4 py-2 rounded-2xl"
          >
            <ArrowLeft className="w-5 h-5" /> 返回重塑
          </button>
          <button 
            onClick={() => setShowShareMenu(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold hover:shadow-lg transition-all"
          >
            <Share className="w-4 h-4" /> 分享行程
          </button>
        </div>

        {/* 分享菜单弹出层 */}
        {showShareMenu && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowShareMenu(false)}></div>
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">分享你的行程</h3>
                <button onClick={() => setShowShareMenu(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleCopyLink}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Link2 className="w-5 h-5" /></div>
                  <div className="text-left">
                    <div className="font-bold">复制分享链接</div>
                    <div className="text-xs text-slate-400">发给微信好友、QQ同行</div>
                  </div>
                </button>
                <button 
                  onClick={handleGeneratePoster}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><ImageIcon className="w-5 h-5" /></div>
                  <div className="text-left">
                    <div className="font-bold">生成精美海报</div>
                    <div className="text-xs text-slate-400">适合分享到朋友圈、小红书</div>
                  </div>
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-all group"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Download className="w-5 h-5" /></div>
                  <div className="text-left">
                    <div className="font-bold">保存为 PDF</div>
                    <div className="text-xs text-slate-400">离线保存、打印高清行程表</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 海报预览弹出层 */}
        {posterUrl && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setPosterUrl(null)}></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-full max-h-full flex flex-col items-center gap-6"
            >
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-white">
                <img src={posterUrl} alt="Travel Poster" className="max-h-[80vh] w-auto" />
                <button 
                  onClick={() => setPosterUrl(null)} 
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-4">
                <a 
                  href={posterUrl} 
                  download={`${tripResult.destination}-AI行程海报.png`}
                  className="flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl"
                >
                  <Download className="w-5 h-5" /> 保存图片到相册
                </a>
              </div>
            </motion.div>
          </div>
        )}

        {/* 隐藏的海报模板 - 用于 html2canvas 渲染 */}
        <div className="fixed left-[-9999px] top-[-9999px]">
          <div id="poster-template" className="w-[400px] bg-slate-50 p-8 flex flex-col gap-6">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
              <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">✈️</div>
                <div className="relative z-10 text-center">
                  <div className="text-sm font-bold opacity-80 mb-2">AI 专属定制旅行</div>
                  <div className="text-3xl font-black">{tripResult.destination}</div>
                  <div className="text-lg font-bold mt-1">{tripResult.days} 天深度游</div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">
                  {tripResult.overview}
                </p>
                <div className="space-y-4">
                  {tripResult.dailyPlans.slice(0, 3).map(plan => (
                    <div key={plan.day} className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">D{plan.day}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800 truncate">{plan.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {plan.activities.map(a => a.title).join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {tripResult.dailyPlans.length > 3 && (
                    <div className="text-center text-[10px] text-slate-300 font-bold tracking-widest">......</div>
                  )}
                </div>
              </div>
              <div className="bg-slate-900 p-6 flex items-center justify-between">
                <div className="text-white">
                  <div className="text-[10px] opacity-60 font-bold mb-1">长按扫码定制同款</div>
                  <div className="text-sm font-black tracking-wider text-blue-400">WanderAI 行程助手</div>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                  {/* 这里可以放一个真实的二维码图片，或者占位图 */}
                  <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-[8px] text-slate-300 font-bold text-center leading-none">QR<br/>CODE</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 头部概览卡片 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[40px] p-8 md:p-12 shadow-sm"
        >
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
            <MapPin className="w-6 h-6" />
            <span className="tracking-wide text-lg">AI 专属定制</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {tripResult.destination} <span className="text-slate-300 mx-2">/</span> {tripResult.days}天
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl font-medium">
            {tripResult.overview}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* 左侧：行程详情 (占3列) */}
          <div className="lg:col-span-3 space-y-6">

            {/* ============== 新增：智能机酒推荐卡片 ============== */}
            {livePrices && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-6 md:p-8 rounded-[32px] border border-blue-100 shadow-sm relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-bold text-slate-800">Travelpayouts 智能机酒推荐</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 推荐机票 */}
                  <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg"><Plane className="w-4 h-4 text-blue-600" /></div>
                      <span className="font-bold text-slate-700 text-sm">去程航班推荐</span>
                      {livePrices.flight.isLCC && <span className="text-[9px] px-1.5 py-0.5 rounded border border-orange-300 text-orange-500 font-semibold ml-auto">廉价航空</span>}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="font-bold text-xl text-slate-900">{String(livePrices.flight.time)}起飞</div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">{String(livePrices.flight.airline)} · {String(livePrices.flight.flight_number)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold mb-0.5">经济舱特价</div>
                        <div className="text-xl font-black text-orange-500"><span className="text-sm">￥</span>{Number(livePrices.flight.ecoPrice).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* 推荐酒店 */}
                  <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white hover:border-purple-200 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg"><Bed className="w-4 h-4 text-purple-600" /></div>
                      <span className="font-bold text-slate-700 text-sm">高性价酒店推荐</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ml-auto ${String(livePrices.hotel.category) === '豪华/五星' ? 'bg-amber-100 text-amber-700' : 'bg-purple-50 text-purple-500'}`}>{String(livePrices.hotel.tag)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-lg text-slate-900 truncate">{String(livePrices.hotel.name)}</div>
                        <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                          <span className="text-amber-500 font-bold">★ {String(livePrices.hotel.rating)}</span> · {String(livePrices.hotel.desc)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 font-bold mb-0.5">{String(livePrices.hotel.category)}</div>
                        <div className="text-xl font-black text-purple-600"><span className="text-sm">￥</span>{Number(livePrices.hotel.numPrice).toLocaleString()}<span className="text-xs font-semibold text-slate-400">/晚</span></div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
            {/* ========================================================== */}

            {/* 天数切换 Tab */}
            <div className="flex overflow-x-auto pb-4 no-scrollbar gap-3 print:hidden">
              {tripResult.dailyPlans.map((plan) => (
                <button
                  key={plan.day}
                  onClick={() => setActiveDay(plan.day)}
                  className={`flex-shrink-0 px-6 py-4 rounded-3xl font-bold transition-all ${
                    activeDay === plan.day 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' 
                    : 'glass-panel text-slate-600 hover:scale-105'
                  }`}
                >
                  <div className="text-sm opacity-80 mb-1">{plan.date || `第 ${plan.day} 天`}</div>
                  <div className="text-lg">Day {plan.day}</div>
                </button>
              ))}
            </div>

            {/* 每日详细安排 */}
            {tripResult.dailyPlans.map((dayPlan, index) => (
              <div key={dayPlan.day} className={`${activeDay === dayPlan.day ? "block" : "hidden print:block"} print:break-after-page print:pt-8`}>
                
                {/* 在打印模式下，每天上方展示该天的路线图 */}
                {/* 使用 opacity-0 和 absolute 让非当前页的地图也能在后台渲染，以便打印时有内容 */}
                <div className={`mb-8 h-[350px] w-full max-w-[800px] mx-auto relative rounded-3xl overflow-hidden border border-slate-200 ${activeDay === dayPlan.day ? "z-[100]" : "absolute top-0 left-0 -z-10 opacity-0 pointer-events-none print:relative print:z-[100] print:opacity-100 print:block"}`}>
                  {dayPlan.activities && <MapRoute activities={dayPlan.activities} style={tripResult.style} />}
                </div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                className="glass-panel rounded-[40px] p-6 md:p-10"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{dayPlan.title}</h2>
                  <p className="text-slate-500 font-medium">在这一天尽情探索 {tripResult.destination} 的魅力。</p>
                </div>

                <div className="space-y-10 relative before:absolute before:inset-0 before:ml-[28px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-blue-200 before:via-indigo-200 before:to-transparent">
                  {dayPlan.activities.map((activity, idx) => {
                    // 尝试匹配该活动到下一个活动的交通路线
                    const nextTransit = dayPlan.transitRoutes?.[idx];
                    
                    return (
                      <div key={activity.id} className="relative print:break-inside-avoid">
                        {/* 景点/活动节点 */}
                        <div className="flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active relative z-20">
                          <div className="flex items-center justify-center w-14 h-14 rounded-full border-[4px] border-white/80 bg-slate-50 text-slate-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 backdrop-blur-md print:border-slate-200 print:bg-white print:shadow-none">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="w-[calc(100%-4.5rem)] md:w-[calc(50%-3rem)] bg-white/60 backdrop-blur-xl p-6 rounded-[28px] border border-white/50 shadow-sm hover:shadow-lg transition-all group-hover:-translate-y-1 print:bg-white print:border-slate-200 print:shadow-none">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-lg text-slate-900">{activity.title}</span>
                              <span className="text-sm font-bold text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-xl border border-blue-200/50 print:bg-transparent print:border-none print:px-0">{activity.time}</span>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed mb-4">{activity.description}</p>
                            <div className="flex items-center justify-between text-sm text-slate-500 font-semibold bg-white/40 p-3 rounded-2xl print:bg-transparent print:p-0 print:gap-4">
                              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500"/> {activity.location}</span>
                              <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-indigo-500"/> ¥{activity.costEstimation ?? 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* 景点之间的公共交通显示 (节点间连接) */}
                        {nextTransit && (
                          <div className="flex justify-start md:justify-center my-6 md:my-8 ml-[1.75rem] md:ml-0 relative z-10 group print:break-inside-avoid">
                            <div className="w-[calc(100%-1rem)] md:w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* 左侧：公共交通路线 */}
                              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 transition-all hover:shadow-md hover:border-blue-300 relative before:absolute before:content-[''] before:-left-[1.75rem] md:before:hidden before:top-1/2 before:w-[1.75rem] before:h-[2px] before:bg-slate-300 print:bg-white print:shadow-none print:border-slate-300">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm shrink-0 border border-blue-100 print:border-slate-300 print:shadow-none">
                                    <span className="text-sm">
                                      {nextTransit.mode === 'subway' ? '🚇' : nextTransit.mode === 'bus' ? '🚌' : nextTransit.mode === 'taxi' ? '🚕' : nextTransit.mode === 'train' ? '🚆' : nextTransit.mode === 'flight' ? '✈️' : '🚶'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                                      前往 <MapPin className="w-3 h-3 text-slate-400 print:hidden" /> {nextTransit.to}
                                    </div>
                                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{nextTransit.instructions}</p>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 text-[12px] font-semibold">
                                  <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100 shadow-sm print:shadow-none">⏳ {nextTransit.estimatedDuration}</span>
                                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 shadow-sm print:shadow-none">公共交通: ¥{nextTransit.costEstimation ?? 0}</span>
                                </div>
                              </div>

                              {/* 右侧：网约车/打车价格 */}
                              <div className="bg-indigo-50/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-between transition-all hover:shadow-md hover:border-indigo-300 print:bg-white print:shadow-none print:border-slate-300">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-50">
                                    <span className="text-xl">🚕</span>
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-indigo-900">推荐网约车/打车</div>
                                    <div className="text-[11px] text-indigo-500 font-medium">更快捷直达目的地</div>
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-indigo-600">
                                  ¥{nextTransit.rideHailingCost || Math.round((nextTransit.costEstimation ?? 0) * 3.5 + 15)}
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ======== 全天行程概览 ======== */}
                {dayPlan.dailyTransitSummary && (
                  <div className="mt-12 bg-slate-50/80 rounded-[28px] p-6 border border-slate-200 shadow-inner print:bg-white print:border-slate-300 print:shadow-none print:break-inside-avoid">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-slate-500" />
                      全天行程交通概览
                    </h3>
                    
                    {/* 全天行程概览路线 */}
                    <div className="mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 shadow-sm print:bg-transparent print:border-slate-300 print:shadow-none">
                      <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
                        <MapPin className="w-4 h-4" /> 路线串联
                      </div>
                      <p className="text-slate-700 font-medium mb-3 text-lg">{dayPlan.dailyTransitSummary.overviewRoute}</p>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4 text-sm font-semibold text-slate-600">
                          <span className="bg-white/60 px-3 py-1.5 rounded-lg print:border print:border-slate-200">⏳ 预估总耗时: {dayPlan.dailyTransitSummary.totalEstimatedDuration}</span>
                          <span className="bg-white/60 px-3 py-1.5 rounded-lg print:border print:border-slate-200">🚌 公交预估花费: ¥{(dayPlan.dailyTransitSummary.totalPublicTransitCost ?? 0).toLocaleString()}</span>
                        </div>
                        {/* 当行程包含较多地点或花费超过一定金额时，推荐网约车（模拟郊区/不便场景） */}
                        <div className="flex gap-4 text-sm font-semibold">
                          <span className="bg-white/80 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 print:border-slate-200 flex items-center gap-1.5">
                            🚕 推荐网约车/打车预估: ¥{(dayPlan.dailyTransitSummary.medianRideHailingCost ?? 0).toLocaleString()} 
                            <span className="text-[10px] bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded font-bold ml-1">更方便/适合郊区</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              </div>
            ))}
          </div>

          {/* 右侧：地图与预算分析 (占2列) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 高德地图模块 */}
            {currentDayPlan && currentDayPlan.activities && (
              <div className="relative z-[99999] print:hidden">
                <MapRoute activities={currentDayPlan.activities} style={tripResult.style} />
              </div>
            )}

            {/* 预算概览 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-slate-900 text-white rounded-[36px] p-8 shadow-xl relative overflow-hidden"
            >
              {/* 背景装饰 */}
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                <Wallet className="w-6 h-6 text-blue-400" /> 预算概览
              </h3>
              
              <div className="text-5xl font-extrabold mb-8 tracking-tight relative z-10">
                <span className="text-2xl font-medium text-slate-400 mr-1">¥</span>
                {(tripResult.budgetBreakdown?.total ?? 0).toLocaleString()}
              </div>

              <div className="space-y-5 relative z-10">
                {[
                  { label: '酒店住宿', value: tripResult.budgetBreakdown?.hotel ?? 0, color: 'bg-indigo-500' },
                  { label: '交通出行', value: tripResult.budgetBreakdown?.transport ?? 0, color: 'bg-blue-500' },
                  { label: '餐饮美食', value: tripResult.budgetBreakdown?.food ?? 0, color: 'bg-orange-500' },
                  { label: '门票玩乐', value: tripResult.budgetBreakdown?.tickets ?? 0, color: 'bg-pink-500' },
                  { label: '其他杂项', value: tripResult.budgetBreakdown?.others ?? 0, color: 'bg-slate-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-slate-300">{item.label}</span>
                      <span>¥ {(item.value ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`${item.color} h-full rounded-full`} 
                        style={{ width: `${Math.max(2, ((item.value ?? 0) / (tripResult.budgetBreakdown?.total || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 每日美食与咖啡推荐 (根据 activeDay 切换) */}
            {currentDayPlan && currentDayPlan.foodCoffeeRecommendations && currentDayPlan.foodCoffeeRecommendations.length > 0 && (
              <motion.div 
                key={`food-${activeDay}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-[36px] p-8 shadow-xl border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
                
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Coffee className="w-6 h-6 text-orange-500" /> Day {activeDay} 附近的美食与咖啡
                </h3>

                <div className="space-y-4">
                  {currentDayPlan.foodCoffeeRecommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-orange-600 shadow-sm shrink-0">{i + 1}</div>
                      <p className="text-slate-700 font-medium text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 公共交通智能推荐框 (由高德地图 API 驱动) */}
            {trafficInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-[36px] p-8 shadow-xl border border-slate-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl group-hover:scale-110 transition-transform duration-500">🚇</div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                    <Plane className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">抵达与交通指引</h3>
                </div>
                
                <div className="flex flex-col gap-4 relative z-10">
                  {/* 路线与价格 */}
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-base font-semibold text-slate-600 flex items-center gap-3">
                      <span className="text-slate-800">{trafficInfo.origin}</span> 
                      <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" /> 
                      <span className="text-slate-800">{trafficInfo.destination}</span>
                    </div>
                    <div className="text-xl font-bold text-[#FF6B6B]">
                      ¥{trafficInfo.ticketCost}
                    </div>
                  </div>

                  {/* 乘车方案气泡 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 text-sm text-slate-700 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 font-semibold text-blue-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
                      推荐公共交通路线 (耗时约 {trafficInfo.durationMinutes} 分钟)
                    </div>
                    <p className="leading-relaxed text-base font-medium text-slate-800">
                      {trafficInfo.instructions}
                    </p>
                  </div>

                  {/* 底部数据 */}
                  <div className="flex gap-6 mt-2 text-sm font-semibold text-slate-500 px-2">
                    <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg">🚶 步行 {trafficInfo.walkingDistance} 米</span>
                    <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg">🛣️ 全程约 {trafficInfo.distanceKm} 公里</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
