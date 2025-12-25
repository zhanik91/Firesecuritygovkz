import React from 'react'
import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { PageLoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy loading для всех страниц
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home"));
const SectionPage = lazy(() => import("@/pages/SectionPage"));
const SubsectionPage = lazy(() => import("@/pages/SubsectionPage"));
const PostPage = lazy(() => import("@/pages/PostPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const Calculators = lazy(() => import("@/pages/Calculators"));
const FireExtinguisherCalculator = lazy(() => import("@/pages/FireExtinguisherCalculator"));
const NGPSCalculator = lazy(() => import("@/pages/NGPSCalculator"));
const CalculatorsMethodology = lazy(() => import("@/pages/CalculatorsMethodology"));
const FireLoadCalculator = lazy(() => import("@/pages/calculators/FireLoadCalculator"));
const EvacuationCalculator = lazy(() => import("@/pages/calculators/EvacuationCalculator"));
const ExplosionCategoryCalculator = lazy(() => import("@/pages/calculators/ExplosionCategoryCalculator"));
const FireAuditCalculator = lazy(() => import("@/pages/calculators/FireAuditCalculator"));
const FireRiskCalculator = lazy(() => import("@/pages/calculators/FireRiskCalculator"));
const AdPage = lazy(() => import("@/pages/AdPage"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const SupplierDashboard = lazy(() => import("@/pages/SupplierDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const EnhancedMarketplace = lazy(() => import("@/pages/EnhancedMarketplace"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const CreateAdPage = lazy(() => import("@/pages/CreateAdPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminCheckPage = lazy(() => import("./pages/AdminCheckPage")); // Импортируем новую страницу
const AdminModerationPage = lazy(() => import("./pages/AdminModerationPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const GuessImageGame = lazy(() => import("@/pages/GuessImageGame"));
const Fire3DTraining = lazy(() => import("@/pages/Fire3DTraining"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/dashboard" component={UserDashboard} />
            <Route path="/supplier-dashboard" component={SupplierDashboard} />
          </>
        )}

        {/* Auth routes */}
        <Route path="/auth" component={AuthPage} />

        {/* Public routes */}
        <Route path="/sections/:slug" component={SectionPage} />
        <Route path="/subsections/:slug" component={SubsectionPage} />
        <Route path="/posts/:slug" component={PostPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/marketplace/create" component={CreateAdPage} />
        <Route path="/enhanced-marketplace" component={EnhancedMarketplace} />
        <Route path="/search" component={SearchPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/calculators" component={Calculators} />
        <Route path="/calculators/fire-extinguishers" component={FireExtinguisherCalculator} />
        <Route path="/calculators/ngps" component={NGPSCalculator} />
        <Route path="/calculators/methodology" component={CalculatorsMethodology} />
        <Route path="/calculators/fire-load" component={FireLoadCalculator} />
        <Route path="/calculators/evacuation" component={EvacuationCalculator} />
        <Route path="/calculators/explosion" component={ExplosionCategoryCalculator} />
        <Route path="/calculators/audit" component={FireAuditCalculator} />
        <Route path="/calculators/risk" component={FireRiskCalculator} />
        <Route path="/games" component={GamesPage} />
        <Route path="/games/guess-image" component={GuessImageGame} />
        <Route path="/games/3d-training" component={Fire3DTraining} />
        <Route path="/gamification" component={lazy(() => import('./pages/GamificationPage').then(m => ({ default: m.GamificationPage })))} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/marketplace/:slug" component={AdPage} />

        {/* Admin routes */}
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/users" component={AdminUsersPage} />
        <Route path="/admin/check" component={AdminCheckPage} />
        <Route path="/admin/moderation" component={AdminModerationPage} />

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Toaster />
              <Router />
            </ErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;