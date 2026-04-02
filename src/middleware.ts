import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 如果请求路径以 /_AMapService 开头，拦截并做反向代理
  if (request.nextUrl.pathname.startsWith('/_AMapService/')) {
    // 移除 /_AMapService 前缀，拼接真实的高德 API 路径
    const targetPath = request.nextUrl.pathname.replace('/_AMapService', '');
    
    // 构造最终请求高德服务器的 URL
    const amapUrl = new URL(targetPath, 'https://webapi.amap.com');
    
    // 把原始请求的所有参数（搜索参数）带上
    request.nextUrl.searchParams.forEach((value, key) => {
      amapUrl.searchParams.append(key, value);
    });

    // 【核心】在这里自动带上你的安全密钥！前端代码里就再也看不到了
    amapUrl.searchParams.append('jscode', '1de0572e5891f1fd71eb523c5febd3f7');

    // 告诉 Next.js 将这个请求重写（代理）到高德官方服务器
    return NextResponse.rewrite(amapUrl);
  }

  return NextResponse.next();
}

// 仅拦截匹配的路由，提高性能
export const config = {
  matcher: '/_AMapService/:path*',
};