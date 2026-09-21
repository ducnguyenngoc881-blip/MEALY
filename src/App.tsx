import React from 'react';
import { MealWiseProvider, useMealWise } from './context/MealWiseContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { MealSetExplorer } from './components/MealSetExplorer';
import { WeeklyBoard } from './components/WeeklyBoard';
import { GroceryList } from './components/GroceryList';
import { CateringPartyPlanner } from './components/CateringPartyPlanner';
import { RecipeCatalog } from './components/RecipeCatalog';
import { FridgeView } from './components/FridgeView';
import { AccountView } from './components/AccountView';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { MealSetDetailModal } from './components/MealSetDetailModal';
import { FastMealApexModal } from './components/FastMealApexModal';
import { MinigameHubModal } from './components/MinigameHubModal';
import { DrinkRouletteModal } from './components/DrinkRouletteModal';
import { Toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ShareCollabCartModal } from './components/ShareCollabCartModal';

const MainContent: React.FC = () => {
  const { activeTab } = useMealWise();

  return (
    <div className="w-full">
      {activeTab === 'meal-sets' && <MealSetExplorer />}
      {activeTab === 'weekly' && <WeeklyBoard />}
      {activeTab === 'party' && <CateringPartyPlanner />}
      {activeTab === 'grocery' && <GroceryList />}
      {activeTab === 'recipes' && <RecipeCatalog />}
      {activeTab === 'pantry' && <FridgeView />}
      {activeTab === 'account' && <AccountView />}
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
      <FastMealApexModal isOpen={isApexModalOpen} onClose={closeApexModal} />
      <MinigameHubModal isOpen={isMinigameHubOpen} onClose={closeMinigameHub} />
      <DrinkRouletteModal isOpen={isDrinkRouletteOpen} onClose={closeDrinkRoulette} />
      <Toast />
      <ConfirmModal />
      <ShareCollabCartModal />
    </>
  );
};

export function App() {
  return (
    <MealWiseProvider>
      <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-200">
        {/* Mobile-first natural container: 100% on real phone, centered max-w-lg on desktop */}
        <div className="w-full sm:max-w-md md:max-w-lg mx-auto min-h-[100dvh] bg-slate-50 dark:bg-slate-950 shadow-2xl relative flex flex-col sm:border-x sm:border-slate-200/80 sm:dark:border-slate-800/80">
          <Navbar />
          <main className="flex-1 px-3 sm:px-4 py-3 pb-24">
            <MainContent />
          </main>
          <Sidebar />
        </div>
        
        {/* Mobile Bottom Sheets & Floating Modals */}
        <GlobalModals />
      </div>
    </MealWiseProvider>
  );
}

export default App;
