import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import FeedbackDashboard from './pages/FeedbackDashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Assessment": Assessment,
    "Results": Results,
    "Dashboard": Dashboard,
    "FeedbackDashboard": FeedbackDashboard,
    "ExecutiveDashboard": ExecutiveDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};