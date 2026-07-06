import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from 'react-router-dom';

// ── layout ────────────────────────────────────────────────────────────────────
import Navbar  from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer  from './components/common/Footer';

// ── pages ─────────────────────────────────────────────────────────────────────
import Home                  from './pages/Home';
import Statistics            from './pages/Statistics';
import StatisticsCharts      from './pages/StatisticsCharts';
import AdvancedAnalytics     from './pages/AdvancedAnalytics';
import EconomicSectors       from './pages/EconomicSectors';
import SectorDetail          from './pages/SectorDetail';
import Vacancies             from './pages/Vacancies';
import JobSeekers            from './pages/JobSeekers';
import Publications          from './pages/Publications';
import APIDocumentation      from './pages/APIDocumentation';
import AdminPublications     from './pages/AdminPublications';
import AdminPublicationsManage from './pages/AdminPublicationsManage';
import EducationTraining     from './pages/EducationTraining';
import AdminJobSeekerReview  from './pages/AdminJobSeekerReview';
import AdminVacancies        from './pages/AdminVacancies';
import EmployerApplications  from './pages/EmployerApplications';
import CareerAdvice          from './pages/CareerAdvice';
import AdminDashboard        from './pages/AdminDashboard';
import EmployerDashboard     from './pages/EmployerDashboard';
import AdminUsers            from './pages/AdminUsers';
import AdminStatistics       from './pages/AdminStatistics';
import EducationTrainingAdmin from './pages/admin/EducationTrainingAdmin';
import { Login, AdminLogin, Register }   from './Auth';

// ── styles ────────────────────────────────────────────────────────────────────
import './styles/App.css';
import PageLoader from './components/common/PageLoader';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();

useEffect(() => {
  console.log("API URL =", process.env.REACT_APP_API_URL);
}, []);

  React.useEffect(() => {
    // show loader for 3s on route change
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app__main">
        <Outlet />
      </main>
      <Footer />
      {loading && <PageLoader />}
    </>
  );
};

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true,                               element: <Home /> },
        { path: 'economic-sectors',                  element: <EconomicSectors /> },
        { path: 'economic-sectors/:sectorId',        element: <SectorDetail /> },
        { path: 'statistics',                        element: <Statistics /> },
        { path: 'statistics-charts',                 element: <StatisticsCharts /> },
        { path: 'analytics',                         element: <AdvancedAnalytics /> },
        { path: 'vacancies',                         element: <Vacancies /> },
        { path: 'jobseekers',                        element: <JobSeekers /> },
        { path: 'publications',                      element: <Publications /> },
        { path: 'api-docs',                          element: <APIDocumentation /> },
        { path: 'career-advice',                     element: <CareerAdvice /> },
        { path: 'career-advice/growing-your-career', element: <CareerAdvice /> },
        { path: 'career-advice/:slug',               element: <CareerAdvice /> },
        { path: 'education-training',                element: <EducationTraining /> },
        { path: 'login',                             element: <Login /> },
        { path: 'register',                          element: <Register /> },

        // ── admin / employer ──────────────────────────────────────────────────────────
        { path: 'employer',                          element: <EmployerDashboard /> },
        { path: 'admin',                             element: <AdminDashboard /> },
        { path: 'admin/jobseekers-review',           element: <AdminJobSeekerReview /> },
        { path: 'employer/vacancies/new',            element: <AdminVacancies /> },
        { path: 'employer/applications',             element: <EmployerApplications /> },
        { path: 'admin/publications',                element: <AdminPublications /> },
        { path: 'admin/publications-manage',         element: <AdminPublicationsManage /> },
        { path: 'admin/education-training',          element: <EducationTrainingAdmin /> },
        { path: 'admin/statistics',                  element: <AdminStatistics /> },
        { path: 'admin/users',                       element: <AdminUsers /> },
      ]
    },
    {
      path: '/admin/login',
      element: <AdminLogin />
    }
  ],
  {
    basename: process.env.PUBLIC_URL,
    future: { v7_startTransition: true }
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;