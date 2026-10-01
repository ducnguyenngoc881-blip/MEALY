import React, { Suspense, lazy } from 'react';
import { MealWiseProvider, useMealWise } from './context/MealWiseContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { MealSetExplorer } from './components/MealSetExplorer';
import { WeeklyBoard } from './components/WeeklyBoard';
import { GroceryList } from './components/GroceryList';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { MealSetDetailModal } from './components/MealSetDetailModal';
import { Toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ShareCollabCartModal } from './components/ShareCollabCartModal';
import { FridgeView } from './components/FridgeView';
import { AuthModal } from './components/AuthModal';
import { DownloadAppModal } from './components/DownloadAppModal';

// Code-split secondary views and heavy interactive modals for ultra-fast initial page load
const CateringPartyPlanner = lazy(() => import('./components/CateringPartyPlanner').then(m => ({ default: m.CateringPartyPlanner })));
const RecipeCatalog = lazy(() => import('./components/RecipeCatalog').then(m => ({ default: m.RecipeCatalog })));
const AccountView = lazy(() => import('./components/AccountView').then(m => ({ default: m.AccountView })));
const FastMealApexModal = lazy(() => import('./components/FastMealApexModal').then(m => ({ default: m.FastMealApexModal })));
const MinigameHubModal = lazy(() => import('./components/MinigameHubModal').then(m => ({ default: m.MinigameHubModal })));
const DrinkRouletteModal = lazy(() => import('./components/DrinkRouletteModal').then(m => ({ default: m.DrinkRouletteModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const TabSuspenseFallback: React.FC = () => (
  <div className="py-16 flex flex-col items-center justify-center text-center">
    <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Đang chuẩn bị nội dung...</p>
  </div>
);

const MainContent: React.FC = () => {
  const { activeTab } = useMealWise();

  return (
    <div className="w-full">
      <Suspense fallback={<TabSuspenseFallback />}>
        {activeTab === 'meal-sets' && <MealSetExplorer />}
        {activeTab === 'weekly' && <WeeklyBoard />}
        {activeTab === 'party' && <CateringPartyPlanner />}
        {activeTab === 'grocery' && <GroceryList />}
        {activeTab === 'recipes' && <RecipeCatalog />}
        {activeTab === 'pantry' && <FridgeView />}
        {activeTab === 'account' && <AccountView />}
      </Suspense>
    </div>
  );
};

const GlobalModals: React.FC = () => {
  const { 
    isApexModalOpen, 
    closeApexModal,
    isMinigameHubOpen,
    closeMinigameHub,
    isDrinkRouletteOpen,
    closeDrinkRoulette
  } = useMealWise();
  return (
    <>
      <OnboardingModal />
      <MealSetDetailModal />
      <RecipeDetailModal />
      <Suspense fallback={null}>
        {isApexModalOpen && <FastMealApexModal isOpen={isApexModalOpen} onClose={closeApexModal} />}
        {isMinigameHubOpen && <MinigameHubModal isOpen={isMinigameHubOpen} onClose={closeMinigameHub} />}
        {isDrinkRouletteOpen && <DrinkRouletteModal isOpen={isDrinkRouletteOpen} onClose={closeDrinkRoulette} />}
      </Suspense>
      <Toast />
      <ConfirmModal />
      <ShareCollabCartModal />
      <AuthModal />
      <DownloadAppModal />
    </>
  );
};

const AppShell: React.FC = () => {
  const { activeTab, user } = useMealWise();
  const isAdminView = activeTab === 'admin' && user?.role === 'admin';

  // DEDICATED DESKTOP ADMIN WEB PORTAL (STANDALONE DESKTOP WEBSITE)
  if (isAdminView) {
    return (
      <div className="min-h-screen w-full bg-[#0D0C0B] text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
        <Suspense fallback={<TabSuspenseFallback />}>
          <AdminDashboard />
        </Suspense>
        <GlobalModals />
      </div>
    );
  }

  // PURE MOBILE APP SHELL (STRICTLY MOBILE PHONE CONTAINER)
  return (
    <div className="min-h-screen bg-[#F3EFE9] dark:bg-[#0D0C0B] text-stone-900 dark:text-[#F5F2EB] font-sans selection:bg-amber-500 selection:text-stone-950 transition-colors duration-200">
      {/* Mobile-first natural container: 100% on real phone, centered max-w-lg on desktop */}
      <div className="w-full sm:max-w-md md:max-w-lg mx-auto min-h-[100dvh] bg-[#FAF8F5] dark:bg-[#121110] shadow-2xl relative flex flex-col sm:border-x sm:border-[#E8E2D8] sm:dark:border-[#252220]">
        <Navbar />
        <main className="flex-1 px-3 sm:px-4 py-3 pb-24">
          <MainContent />
        </main>
        <Sidebar />
      </div>
      
      {/* Mobile Bottom Sheets & Floating Modals */}
      <GlobalModals />
    </div>
  );
};

export function App() {
  return (
    <MealWiseProvider>
      <AppShell />
    </MealWiseProvider>
  );
}

export default App;
