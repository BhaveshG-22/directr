# Clerk Authentication Integration

## Overview

This app uses [Clerk](https://clerk.com) for authentication. Clerk handles:
- User sign-up and sign-in
- OAuth providers (Google, GitHub, etc.)
- Email verification
- Session management
- User profile management

## Database Schema Changes

### Removed Models
The following NextAuth models are **removed** since Clerk handles these:
- ❌ `Account` - Clerk manages OAuth connections
- ❌ `Session` - Clerk handles sessions
- ❌ `VerificationToken` - Clerk manages email verification

### Modified User Model
```prisma
model User {
  id            String    @id  // Clerk user ID (e.g., user_2abc...)
  email         String    @unique
  name          String?
  imageUrl      String?   // Clerk profile image
  username      String?   // Clerk username
  role          UserRole  @default(USER)
  creditBalance Int       @default(0)
  // ... other app-specific fields
}
```

**Key Changes:**
- `id` is now Clerk's user ID (not auto-generated)
- `imageUrl` replaces `image` (Clerk's field name)
- `username` added (Clerk provides this)
- Removed `password`, `emailVerified` (Clerk handles these)
- Added `creditBalance` for quick access

### New WebhookEvent Model
```prisma
model WebhookEvent {
  id          String        @id @default(cuid())
  eventType   String        // user.created, user.updated, etc.
  clerkId     String?       // Clerk user ID
  status      WebhookStatus
  payload     Json          // Full webhook payload
  receivedAt  DateTime      @default(now())
  processedAt DateTime?
}
```

This tracks Clerk webhook deliveries for:
- User creation
- User updates
- User deletion
- Organization events

## Setup Steps

### 1. Install Clerk
```bash
npm install @clerk/nextjs
```

### 2. Environment Variables
Add to `.env`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=whsec_...
```

### 3. Wrap App with ClerkProvider
In `app/layout.tsx`:
```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 4. Create Middleware
Create `middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/photoshoot(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### 5. Set Up Webhooks

#### Create Webhook Endpoint
Create `app/api/webhooks/clerk/route.ts`:
```typescript
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Error: Verification failed', { status: 400 })
  }

  // Log webhook event
  await prisma.webhookEvent.create({
    data: {
      eventType: evt.type,
      clerkId: evt.data.id,
      status: 'PENDING',
      payload: payload,
    },
  })

  // Handle different event types
  const eventType = evt.type

  if (eventType === 'user.created') {
    await prisma.user.create({
      data: {
        id: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address || '',
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || null,
        imageUrl: evt.data.image_url,
        username: evt.data.username,
      },
    })
  }

  if (eventType === 'user.updated') {
    await prisma.user.update({
      where: { id: evt.data.id },
      data: {
        email: evt.data.email_addresses[0]?.email_address,
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || null,
        imageUrl: evt.data.image_url,
        username: evt.data.username,
      },
    })
  }

  if (eventType === 'user.deleted') {
    await prisma.user.delete({
      where: { id: evt.data.id },
    })
  }

  return new Response('Webhook processed', { status: 200 })
}
```

#### Configure Webhook in Clerk Dashboard
1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy webhook secret to `.env` as `CLERK_WEBHOOK_SECRET`

### 6. Using Clerk in Components

#### Server Components
```typescript
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    return <div>Not signed in</div>
  }

  return <div>Hello {user?.firstName}!</div>
}
```

#### Client Components
```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Sign in required</div>

  return <div>Hello {user.firstName}!</div>
}
```

### 7. Accessing Database User
```typescript
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const { userId } = await auth()

  if (!userId) return null

  // Get user from our database with app-specific data
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      photoshoots: true,
    }
  })

  return <div>Credit Balance: {dbUser?.creditBalance}</div>
}
```

## Benefits of Clerk

1. **No Auth Boilerplate** - Authentication just works
2. **Security** - Clerk handles password hashing, session tokens, CSRF protection
3. **OAuth Made Easy** - Add Google/GitHub/etc. with a few clicks
4. **User Management UI** - Pre-built sign-in/sign-up components
5. **Session Management** - Automatic token refresh and expiry
6. **Mobile Support** - Works with React Native apps
7. **Organizations** - Built-in multi-tenancy support

## Migration from NextAuth

If you're migrating from NextAuth:
1. Remove NextAuth config and API route
2. Delete Account, Session, VerificationToken models
3. Run migrations to update User table
4. Update all `session.user.id` to `auth().userId`
5. Replace `<SessionProvider>` with `<ClerkProvider>`
6. Update middleware to use Clerk

## Testing Webhooks Locally

Use Clerk's webhook testing or ngrok:
```bash
ngrok http 3000
# Update Clerk webhook endpoint to ngrok URL
```

## Additional Resources

- [Clerk Next.js Docs](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [Clerk API Reference](https://clerk.com/docs/reference/clerkjs)
