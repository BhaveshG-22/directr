import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/photoshoot(.*)',
  '/api/photoshoot(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for upload route - handle auth in the route itself
  if (req.nextUrl.pathname === '/api/upload') {
    return NextResponse.next()
  }

  // For all other protected routes, ensure user is authenticated
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
