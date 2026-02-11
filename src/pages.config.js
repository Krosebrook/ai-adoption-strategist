/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAgentHub from './pages/AIAgentHub';
import AIGovernance from './pages/AIGovernance';
import AIPerformanceMonitor from './pages/AIPerformanceMonitor';
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import Assessment from './pages/Assessment';
import CustomDashboard from './pages/CustomDashboard';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import FeedbackDashboard from './pages/FeedbackDashboard';
import Home from './pages/Home';
import ImplementationPlan from './pages/ImplementationPlan';
import Onboarding from './pages/Onboarding';
import PlatformComparison from './pages/PlatformComparison';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import Reports from './pages/Reports';
import Results from './pages/Results';
import RiskMonitoring from './pages/RiskMonitoring';
import Settings from './pages/Settings';
import StrategyAutomation from './pages/StrategyAutomation';
import TemplateBuilder from './pages/TemplateBuilder';
import Training from './pages/Training';
import Trends from './pages/Trends';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAgentHub": AIAgentHub,
    "AIGovernance": AIGovernance,
    "AIPerformanceMonitor": AIPerformanceMonitor,
    "AdminPanel": AdminPanel,
    "Analytics": Analytics,
    "Assessment": Assessment,
    "CustomDashboard": CustomDashboard,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "ExecutiveDashboard": ExecutiveDashboard,
    "FeedbackDashboard": FeedbackDashboard,
    "Home": Home,
    "ImplementationPlan": ImplementationPlan,
    "Onboarding": Onboarding,
    "PlatformComparison": PlatformComparison,
    "PredictiveAnalytics": PredictiveAnalytics,
    "Reports": Reports,
    "Results": Results,
    "RiskMonitoring": RiskMonitoring,
    "Settings": Settings,
    "StrategyAutomation": StrategyAutomation,
    "TemplateBuilder": TemplateBuilder,
    "Training": Training,
    "Trends": Trends,
    "Landing": Landing,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};