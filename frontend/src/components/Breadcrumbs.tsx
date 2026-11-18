import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    machines: 'Machines',
    predictions: 'Predictions',
    explainability: 'Explainable AI',
    'survival-analysis': 'Survival Analysis',
    'factory-analytics': 'Factory Analytics',
    maintenance: 'Maintenance',
    alerts: 'Alert Center',
    simulation: 'What-if Simulation',
    reports: 'Reports',
    settings: 'Settings',
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 py-2">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-[#EA580C] transition-colors"
      >
        <Home className="h-3.5 w-3.5 mr-1" />
        <span>PredictX</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[name] || name.toUpperCase();

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[#EA580C] transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
