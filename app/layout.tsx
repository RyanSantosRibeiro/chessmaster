import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import Navlinks from '@/components/ui/Navbar/Navlinks';
import Topbar from '@/components/ui/Topbar';

const title = 'Aurion Runes';
const description = 'Place to play and bet with chessmasters';

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
  const supabase = createClient();
  const user = await getUser(supabase);
  return (
    <html lang="en" data-theme="dark" className="dark">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@5"
          rel="stylesheet"
          type="text/css"
        />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body className="bg-[#0e171e_!important]">
        <AuthProvider initialUser={user}>
          <WalletProvider>
            <div className="flex flex-col w-screen h-screen">
              <div className="flex flex-row w-full h-full">
                <div className="sticky top-0 left-0 bg-[#121c22] z-40 transition-all duration-150 h-full w-full max-w-[180px] p-3">
                  <Navlinks />
                </div>
                <main
                  id="skip"
                  className="min-h-screen max-h-screen w-full flex flex-col justify-start items-center justify-center overflow-x-hidden overflow-y-auto"
                >
                    <Topbar />
                  
                  <div className='w-full h-[100%] flex flex-col justify-start'>
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <Suspense>
              <Toaster />
            </Suspense>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
