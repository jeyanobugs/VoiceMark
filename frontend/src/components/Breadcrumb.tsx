import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="bg-slate-50 border-b border-slate-200 px-8 py-3">
      <ul className="flex items-center list-none gap-2 text-sm text-slate-500">
        <li>
          <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <React.Fragment key={to}>
              <ChevronRight size={14} className="text-slate-400" />
              <li>
                {last ? (
                  <span className="text-slate-800 font-medium">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                ) : (
                  <Link to={to} className="hover:text-blue-600 transition-colors">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
