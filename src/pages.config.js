import AIAgentHub from './pages/AIAgentHub';
import AIGovernance from './pages/AIGovernance';
import Analytics from './pages/Analytics';
import Assessment from './pages/Assessment';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAgentHub": AIAgentHub,
    "AIGovernance": AIGovernance,
    "Analytics": Analytics,
    "Assessment": Assessment,
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};