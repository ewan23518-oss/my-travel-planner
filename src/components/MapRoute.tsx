'use client';

import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Activity, TravelStyle } from '@/lib/types';
import { Maximize2, X } from 'lucide-react';

interface MapRouteProps {
  activities: Activity[];
  style?: TravelStyle;
}

export default function MapRoute({ activities, style }: MapRouteProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 【核心修复1】必须在 AMapLoader.load 之前严格挂载到 window 对象上！
    if (typeof window !== 'undefined') {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: '1de0572e5891f1fd71eb523c5febd3f7',
      };
    }

    AMapLoader.load({
      key: '037cd5541a2c71263f8cb1e732f0a777', // Web端开发者Key
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Polyline', 'AMap.Walking'],
    }).then((AMap) => {
      if (!isMounted || !mapContainerRef.current) return;
      
      if (!mapInstance.current) {
        mapInstance.current = new AMap.Map(mapContainerRef.current, {
          zoom: 11,
          resizeEnable: true,
        });
      }

      const map = mapInstance.current;
      map.clearMap();

      const validActivities = activities.filter(a => a.coordinates && a.coordinates.length === 2);
      if (validActivities.length === 0) return;

      const path = validActivities.map(a => new AMap.LngLat(a.coordinates![0], a.coordinates![1]));

      validActivities.forEach((act, index) => {
        const marker = new AMap.Marker({
          position: new AMap.LngLat(act.coordinates![0], act.coordinates![1]),
          title: act.title,
          content: `<div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59,130,246,0.4); border: 2px solid white;">${index + 1}</div>`,
          offset: new AMap.Pixel(-16, -16),
        });
        map.add(marker);
      });

      if (path.length > 1) {
        if (style === 'citywalk') {
          // CityWalk 模式：使用步行规划 API 绘制真实道路路线
          const walking = new AMap.Walking({
            map: map,
            hideMarkers: true, // 不显示默认起点终点
            isOutline: true,
            outlineColor: '#ffffff',
            autoFitView: false,
          });

          // 递归绘制每一段
          const drawSegments = async (index: number) => {
            if (index >= path.length - 1) return;
            
            walking.search(path[index], path[index + 1], (status: string, result: any) => {
              if (status === 'complete') {
                // 成功绘制一段
                drawSegments(index + 1);
              } else {
                // 如果步行规划失败（比如跨海或者没有路），回退到直线
                const polyline = new AMap.Polyline({
                  path: [path[index], path[index+1]],
                  strokeColor: "#3b82f6",
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                  strokeStyle: "dashed",
                  map: map
                });
                drawSegments(index + 1);
              }
            });
          };
          drawSegments(0);
        } else {
          // 普通模式：直接连线
          const polyline = new AMap.Polyline({
            path: path,
            isOutline: true,
            outlineColor: '#ffffff',
            borderWeight: 3,
            strokeColor: "#3b82f6",
            strokeOpacity: 0.9,
            strokeWeight: 6,
            strokeStyle: "solid",
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50,
            showDir: true,
          });
          map.add(polyline);
        }
      }

      map.setFitView(null, false, [60, 60, 60, 60]);

    }).catch(e => {
      console.error('AMap load failed:', e);
    });

    return () => {
      isMounted = false;
    };
  }, [activities]);

  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.resize();
        mapInstance.current.setFitView(null, false, [60, 60, 60, 60]);
      }, 300);
    }
  }, [isExpanded]);

  return (
    <>
      {/* 【核心修复2】当 isExpanded 为 true 时，动态移除 backdrop-blur-2xl，因为毛玻璃滤镜会破坏 position: fixed 导致无法全屏！ */}
      <div className={`bg-white/60 border border-white/50 rounded-[36px] p-2 shadow-sm relative group mb-6 transition-all duration-300 ${isExpanded ? 'z-[99999]' : 'backdrop-blur-2xl'}`}>
        <div className={`w-full transition-all duration-300 ${isExpanded ? 'h-0 opacity-0' : 'h-[320px] opacity-100'}`} />
        
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded 
              ? 'fixed inset-4 md:inset-12 z-[99999] bg-white rounded-[40px] shadow-2xl border border-slate-200' 
              : 'absolute inset-2 rounded-[28px] z-10'
          }`}
        >
          <div ref={mapContainerRef} className="w-full h-full" />

          <div className={`absolute left-4 top-4 z-[110] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm font-bold text-slate-800 border border-white/50 flex items-center gap-2 transition-all ${isExpanded ? 'text-lg scale-110 origin-top-left left-6 top-6' : 'text-sm'}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            行程轨迹
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute z-[110] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white/50 transition-all hover:scale-105 ${
              isExpanded 
                ? 'right-6 top-6 text-red-500 hover:bg-red-50 shadow-lg' 
                : 'right-4 top-4 text-slate-600 hover:text-blue-600'
            }`}
            title={isExpanded ? "关闭全屏" : "全屏放大"}
          >
            {isExpanded ? <X className="w-6 h-6" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
        
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99990] transition-opacity" 
            onClick={() => setIsExpanded(false)}
          ></div>
        )}
      </div>
    </>
  );
}
