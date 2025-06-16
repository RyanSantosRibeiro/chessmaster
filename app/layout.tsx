import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import Navlinks from '@/components/ui/Navbar/Navlinks';

const title = 'Next.js Subscription Starter';
const description = 'Brought to you by Vercel, Stripe, and Supabase.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const supabase = createClient()
  const user = await getUser(supabase)
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body className="bg-base-200">
        <AuthProvider  initialUser={user}>
          <div className='flex w-screen h-screen'>
               <div className="sticky top-0 left-0 bg-[#13181b] z-40 transition-all duration-150 h-full w-full max-w-[160px] p-2">
                      <Navlinks user={user} />
                    </div>
              <main
                id="skip"
                className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
              >
                {children}
              </main>
          </div>
          <Suspense>
            <Toaster />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
