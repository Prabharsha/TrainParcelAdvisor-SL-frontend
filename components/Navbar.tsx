'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaTrain, FaBox, FaTicketAlt, FaSearch, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(authApi.isAuthenticated());
    setUserName(authApi.getUserName());
    setUserRole(authApi.getUserRole());
  }, [pathname]);

  const handleLogout = () => {
    authApi.logout();
    toast.success('Logged out successfully');
    setIsAuthenticated(false);
    setUserName(null);
    setUserRole(null);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <FaTrain className="text-3xl text-railway-red-700 group-hover:text-railway-red-800 transition-colors" />
            <span className="text-xl font-bold text-railway-blue-900 hidden sm:block">
              TrainParcelAdvisor SL
            </span>
            <span className="text-xl font-bold text-railway-blue-900 sm:hidden">
              TPA SL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/parcels/book"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/parcels/book')
                  ? 'bg-railway-red-100 text-railway-red-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaBox />
              <span>Send Parcel</span>
            </Link>

            <Link
              href="/tickets/book"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/tickets/book')
                  ? 'bg-railway-red-100 text-railway-red-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaTicketAlt />
              <span>Book Ticket</span>
            </Link>

            <Link
              href="/track"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/track')
                  ? 'bg-railway-red-100 text-railway-red-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaSearch />
              <span>Track</span>
            </Link>

            {/* My Parcels/Bookings - Only for authenticated users */}
            {isAuthenticated && userRole === 'CUSTOMER' && (
              <>
                <Link
                  href="/parcels/my-parcels"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/parcels/my-parcels')
                      ? 'bg-railway-blue-100 text-railway-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaBox />
                  <span>My Parcels</span>
                </Link>

                <Link
                  href="/tickets/my-bookings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/tickets/my-bookings')
                      ? 'bg-railway-blue-100 text-railway-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaTicketAlt />
                  <span>My Bookings</span>
                </Link>
              </>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-gray-500 text-xs">{userRole}</p>
                </div>
                {userRole === 'ADMIN' && (
                  <Link href="/admin/dashboard" className="btn-secondary text-sm">
                    Dashboard
                  </Link>
                )}
                {userRole === 'STATION_MASTER' && (
                  <Link href="/station-master/dashboard" className="btn-secondary text-sm">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary flex items-center gap-2 ml-4">
                <FaUser />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link
                href="/parcels/book"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive('/parcels/book')
                    ? 'bg-railway-red-100 text-railway-red-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaBox />
                <span>Send Parcel</span>
              </Link>

              <Link
                href="/tickets/book"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive('/tickets/book')
                    ? 'bg-railway-red-100 text-railway-red-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaTicketAlt />
                <span>Book Ticket</span>
              </Link>

              <Link
                href="/track"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive('/track')
                    ? 'bg-railway-red-100 text-railway-red-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaSearch />
                <span>Track</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-4">
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-gray-500 text-xs">{userRole}</p>
                  </div>
                  {userRole === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="btn-secondary text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {userRole === 'STATION_MASTER' && (
                    <Link
                      href="/station-master/dashboard"
                      className="btn-secondary text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn-outline flex items-center gap-2 w-full"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
