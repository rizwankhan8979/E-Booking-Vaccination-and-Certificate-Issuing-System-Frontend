'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { id: 'users', label: 'Users', path: '/dashboard/users', icon: 'users' },
  { id: 'doctors', label: 'Doctors', path: '/dashboard/doctors', icon: 'stethoscope' },
  { id: 'centers', label: 'Vaccination Centers', path: '/dashboard/centers', icon: 'building' },
  { id: 'vaccines', label: 'Vaccines', path: '/dashboard/vaccines', icon: 'syringe' },
  { id: 'doses', label: 'Doses', path: '/dashboard/doses', icon: 'vial', adminOnly: true },
  { id: 'appointments', label: 'Appointments', path: '/dashboard/appointments', icon: 'calendar' },
  { id: 'profile', label: 'My Profile', path: '/dashboard/profile', icon: 'user', userOnly: true },
];

const icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  stethoscope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  ),
  syringe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
      <path d="m9 11 4 4" />
      <path d="m5 19-3 3" />
      <path d="m14 4 6 6" />
    </svg>
  ),
  vial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2v2" />
      <path d="M17 2v2" />
      <path d="M5 4h14" />
      <rect width="14" height="16" x="5" y="4" rx="2" />
      <path d="M5 10h14" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const sectionTitles = {
  users: 'Users Management',
  doctors: 'Doctors Management',
  centers: 'Vaccination Centers',
  vaccines: 'Vaccines Management',
  doses: 'Doses Management',
  appointments: 'Appointments',
  profile: 'My Profile',
};


import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Force recompile 1
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [userRole, setUserRole] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('userRole') : null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Allow guests to view these sections
    const publicDashboardPaths = [
      '/dashboard',
      '/dashboard/doctors',
      '/dashboard/vaccines',
      '/dashboard/centers'
    ];

    if (!token && pathname && !publicDashboardPaths.includes(pathname)) {
      window.location.href = '/?auth=login&session=expired';
      return;
    }

    // Fetch Profile to get accurate role
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        const role = response.data.role;
        setUserRole(role);
        localStorage.setItem('userRole', role);
      } catch (err) {
        console.error("Error fetching profile roles:", err);
      }
    };
    if (token) fetchProfile();
  }, [pathname]);

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) return userRole === 'ADMIN';
    if (item.userOnly) return userRole === 'USER';
    return true;
  });

  const activeSection = pathname === '/dashboard' ? 'overview' : (pathname.split('/')[2] || 'users');
  const title = activeSection === 'overview' ? 'Overview' : (sectionTitles[activeSection] || 'Dashboard');

  return (
    <div className="app-container">
      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            e-Booking
          </Link>
        </div>
        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {icons[item.icon]}
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div style={{ flex: 1 }}></div>

          <button
            className="sidebar-nav-item"
            style={{ 
              color: isLogoutHovered ? '#ef4444' : 'var(--text-secondary)', 
              background: isLogoutHovered ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              marginTop: 'auto', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                toast.success("Logout Successful");
                router.push('/');
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>
            {/* Title Icon */}
            <span style={{ marginRight: '10px' }}>
              {activeSection === 'overview' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              ) : (
                icons[menuItems.find(i => i.id === activeSection)?.icon] || icons['users']
              )}
            </span>
            <span>{title}</span>
          </div>
          <div className="header-actions">
            <Link href="/" className="btn btn-outline btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px 0' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
