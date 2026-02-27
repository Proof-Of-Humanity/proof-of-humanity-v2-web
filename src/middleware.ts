import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  const isClaimPage = pathname.includes('/claim');
  const isFFmpegResource = pathname.startsWith('/ffmpeg/');
  const requiresCrossOriginIsolation = isClaimPage || isFFmpegResource;

  if (requiresCrossOriginIsolation) {
    // SharedArrayBuffer for ffmpeg.wasm requires cross-origin isolation.
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

    if (isFFmpegResource) {
      response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - static files
     * - image optimization
     * - webpack HMR
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)',
  ],
};
