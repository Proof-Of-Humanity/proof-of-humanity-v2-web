import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Check if this is a claim page or FFmpeg resource
  const isClaimPage = pathname.includes('/claim');
  const isFFmpegResource = pathname.startsWith('/ffmpeg/');
  
  if (isClaimPage || isFFmpegResource) {
    // These headers enable SharedArrayBuffer which is required by FFmpeg
    // COEP: require-corp means all cross-origin resources must explicitly opt-in with CORP headers
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // COOP: same-origin prevents other origins from accessing our window object
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    
    if (isFFmpegResource) {
      // FFmpeg files are same-origin, so they can use same-origin CORP
      response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Claim pages can load cross-origin resources if they have proper CORP headers
      response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  } else {
    // For non-claim pages, only apply COOP for basic security without blocking resources
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
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
