import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Coffee,
  Percent,
  Wrench,
  CalendarDays,
  BookmarkCheck,
  Heart,
  UserCircle2,
  Handshake,
  ShieldCheck,
  LogOut,
  Search,
  MapPin,
  Bell,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DEHRADUN_AREAS } from '../../types/campusloop';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, profile, isAdmin, logout } = useAuth();
  const {
    globalSearch,
    setGlobalSearch,
    selectedArea,
    setSelectedArea,
    myBookings,
    myRedemptions,
    myEventRegistrations,
    myFavorites,
    allPartnerApplications,
  } = useData();
  const { showToast, confirm } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const accepted = await confirm({
      title: 'Log out of CampusLoop?',
      message: 'You will need to sign in again with your Firebase account to access your saved offers and bookings.',
      confirmLabel: 'Logout',
    });
    if (!accepted) return;
    await logout();
    showToast('Signed out successfully', 'info');
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/explore' && location.pathname !== '/cafes') {
      navigate('/explore');
    }
  };

  const displayName = profile?.fullName || user?.displayName || 'Student';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const activeRedemptions = myRedemptions.filter((r) => r.status === 'Active');
  const pendingBookings = myBookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Confirmed'
  );
  const pendingPartnerApps = isAdmin
    ? allPartnerApplications.filter((a) => a.status === 'Pending')
    : [];

  const notifications = [
    ...pendingPartnerApps.slice(0, 2).map((app) => ({
      id: `app-${app.id}`,
      title: `New partner application: ${app.businessName}`,
      subtitle: `${app.category} · Pending review`,
      to: '/admin',
    })),
    ...activeRedemptions.slice(0, 2).map((red) => ({
      id: `red-${red.id}`,
      title: `Active code ${red.code}`,
      subtitle: `${red.businessName} · ${red.discountLabel}`,
      to: '/bookings',
    })),
    ...pendingBookings.slice(0, 2).map((bk) => ({
      id: `bk-${bk.id}`,
      title: `Service booking: ${bk.serviceTitle}`,
      subtitle: `${bk.bookingDate} · ${bk.status}`,
      to: '/bookings',
    })),
    ...myEventRegistrations
      .filter((r) => r.status === 'Confirmed')
      .slice(0, 2)
      .map((reg) => ({
        id: `reg-${reg.id}`,
        title: `Event pass: ${reg.eventName}`,
        subtitle: `${reg.eventDate} · ${reg.ticketCode}`,
        to: '/bookings',
      })),
  ];

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Explore', to: '/explore', icon: Compass },
    { label: 'Cafés & Restaurants', to: '/cafes', icon: Coffee },
    { label: 'Exclusive Offers', to: '/offers', icon: Percent },
    { label: 'Services', to: '/services', icon: Wrench },
    { label: 'Events', to: '/events', icon: CalendarDays },
    { label: 'My Bookings', to: '/bookings', icon: BookmarkCheck },
    {
      label: 'Wishlist',
      to: '/wishlist',
      icon: Heart,
      count: myFavorites.length > 0 ? myFavorites.length : undefined,
    },
    { label: 'Partner With Us', to: '/partner', icon: Handshake },
    { label: 'My Profile', to: '/profile', icon: UserCircle2 },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between border-b border-[#EAE6F3] px-5">
        <Link to="/dashboard" className="focus:outline-none">
          <BrandLogo />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-[#645D78] hover:bg-[#F3EDFF] hover:text-[#252033] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#F3EDFF] text-[#45207A]'
                      : 'text-[#544D68] hover:bg-[#FAFAFC] hover:text-[#252033]'
                  }`
                }
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <span className="ml-2 text-xs font-semibold tabular-nums text-[#673AB7]">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {isAdmin && (
          <div className="mt-5 border-t border-[#EAE6F3] pt-4">
            <p className="px-3.5 text-xs font-medium text-[#645D78]">Administration</p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `mt-1.5 flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#45207A] text-white'
                    : 'text-[#45207A] hover:bg-[#F3EDFF]'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Admin Dashboard</span>
              </span>
              {pendingPartnerApps.length > 0 && (
                <span className="text-xs font-semibold tabular-nums">
                  {pendingPartnerApps.length}
                </span>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="border-t border-[#EAE6F3] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#645D78] transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFC]">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#EAE6F3] bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#252033]/40 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[82vw] border-r border-[#EAE6F3] bg-white shadow-xl">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#EAE6F3] bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-xl p-2 text-[#252033] hover:bg-[#F3EDFF] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 max-w-md"
              role="search"
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#645D78]" />
              <input
                type="search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search cafés, offers, services, events..."
                className="w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] py-2 pl-10 pr-4 text-sm text-[#252033] placeholder:text-[#8E86A3] transition-colors focus:border-[#673AB7] focus:bg-white focus:outline-none"
              />
            </form>

            {/* Location Selector */}
            <div className="relative hidden items-center md:flex">
              <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-[#673AB7]" />
              <select
                aria-label="Filter by Dehradun area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="appearance-none rounded-xl border border-[#EAE6F3] bg-white py-2 pl-9 pr-8 text-sm font-medium text-[#252033] transition-colors hover:border-[#D4CBE8] focus:border-[#673AB7] focus:outline-none"
              >
                {DEHRADUN_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area === 'All Dehradun' ? 'Dehradun · All Areas' : `Dehradun · ${area}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#645D78]" />
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE6F3] bg-white text-[#252033] transition-colors hover:bg-[#FAFAFC]"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#673AB7] px-1 text-[10px] font-bold tabular-nums text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#EAE6F3] px-4 py-3">
                    <span className="text-sm font-semibold text-[#252033]">
                      Activity & Passes
                    </span>
                    <span className="text-xs text-[#645D78] tabular-nums">
                      {notifications.length} active
                    </span>
                  </div>
                  <div className="max-h-80 divide-y divide-[#EAE6F3] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-[#645D78]">
                        No active bookings, event passes, or redeemed offers yet.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <Link
                          key={item.id}
                          to={item.to}
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3 transition-colors hover:bg-[#FAFAFC]"
                        >
                          <p className="text-sm font-medium text-[#252033] truncate">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#645D78] truncate">
                            {item.subtitle}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-xl border border-[#EAE6F3] bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-[#FAFAFC]"
              >
                {profile?.photoURL || user?.photoURL ? (
                  <img
                    src={profile?.photoURL || user?.photoURL || ''}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3EDFF] text-xs font-bold text-[#45207A]">
                    {initials || 'CL'}
                  </div>
                )}
                <span className="hidden max-w-[130px] truncate text-sm font-medium text-[#252033] sm:inline">
                  {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#645D78]" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white shadow-xl">
                  <div className="border-b border-[#EAE6F3] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-[#252033]">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-[#645D78]">
                      {profile?.email || user?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-[#252033] transition-colors hover:bg-[#FAFAFC]"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-[#252033] transition-colors hover:bg-[#FAFAFC]"
                    >
                      My Bookings & Codes
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-[#252033] transition-colors hover:bg-[#FAFAFC]"
                    >
                      Wishlist ({myFavorites.length})
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-[#673AB7] transition-colors hover:bg-[#F3EDFF]"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="mt-1 block w-full rounded-lg border-t border-[#EAE6F3] px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
