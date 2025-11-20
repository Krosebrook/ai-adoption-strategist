import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import FeedbackDashboard from './pages/FeedbackDashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import TemplateBuilder from './pages/TemplateBuilder';
import PlatformComparison from './pages/PlatformComparison';
import Trends from './pages/Trends';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Assessment": Assessment,
    "Results": Results,
    "Dashboard": Dashboard,
    "FeedbackDashboard": FeedbackDashboard,
    "ExecutiveDashboard": ExecutiveDashboard,
    "Settings": Settings,
    "Reports": Reports,
    "TemplateBuilder": TemplateBuilder,
    "PlatformComparison": PlatformComparison,
    "Trends": Trends,
    "PredictiveAnalytics": PredictiveAnalytics,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};