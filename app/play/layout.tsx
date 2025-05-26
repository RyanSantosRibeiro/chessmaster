
import { PropsWithChildren, Suspense } from 'react';
import 'styles/main.css';
import { MatchProvider } from '@/contexts/MatchContext';
import { ChessVsBotProvider } from '@/contexts/GameBot';


export default async function RootPlayLayout({ children }: PropsWithChildren) {
  return (
    <MatchProvider>
      <ChessVsBotProvider>
          {children}
      </ChessVsBotProvider>
    </MatchProvider>
  );
}
