import { Outlet, useLocation } from 'react-router';
import { CommandRail } from './CommandRail';
import { TopBar } from './TopBar';
import { AnimatePresence, motion } from 'motion/react';

/**
 * CommandShell — the new app shell (Fase 1).
 * Dark rail (Tactical) + light context topbar (Swiss) + animated page outlet.
 */
export function CommandShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-background">
      <CommandRail />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 w-full pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
