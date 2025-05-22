import { Link, Outlet, useLocation } from 'react-router';

export default function AppLayout() {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/upload', label: 'Upload' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <nav className="bg-white shadow px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">CERTQUEST</h1>
        <div className="flex gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium hover:text-blue-600 ${
                location.pathname === link.to ? 'text-blue-600 underline' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="p-6 max-w-4xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
