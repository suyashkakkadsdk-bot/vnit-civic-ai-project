import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PortalSelection } from './components/PortalSelection';
import { HowItWorks } from './components/HowItWorks';
import { CommonIssues } from './components/CommonIssues';
import { CitizenPortal } from './components/CitizenPortal';
import { GovernmentPortal } from './components/GovernmentPortal';
import { MyReports } from './components/MyReports';
import { AuthLanding } from './components/AuthLanding';
import { AccessDenied } from './components/AccessDenied';
import { Footer } from './components/Footer';
import { ComplaintCategory, CivicComplaint, AuthUser, AuthRole } from './types/api';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user: currentUser, login: authLogin, logout: authLogout } = useAuth();

  const [activeView, setActiveView] = useState<
    'home' | 'citizen' | 'government' | 'my-reports' | 'how-it-works' | 'login'
  >('home');

  const [loginDefaultRole, setLoginDefaultRole] = useState<AuthRole>('citizen');
  const [prefilledCategory, setPrefilledCategory] = useState<ComplaintCategory>('Road Damage');
  const [prefilledDescription, setPrefilledDescription] = useState<string>('');

  const handleLogin = (user: AuthUser) => {
    authLogin(user);
    if (user.role === 'government') {
      setActiveView('government');
    } else {
      setActiveView('citizen');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    authLogout();
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLoginWithRole = (role: AuthRole = 'citizen') => {
    setLoginDefaultRole(role);
    setActiveView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCitizen = () => {
    if (!currentUser) {
      handleOpenLoginWithRole('citizen');
    } else {
      setActiveView('citizen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGovernment = () => {
    if (!currentUser) {
      handleOpenLoginWithRole('government');
    } else {
      setActiveView('government');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategoryFromHome = (category: ComplaintCategory, defaultDescription?: string) => {
    setPrefilledCategory(category);
    if (defaultDescription) {
      setPrefilledDescription(defaultDescription);
    }
    if (!currentUser) {
      handleOpenLoginWithRole('citizen');
    } else {
      setActiveView('citizen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenMyReports = () => {
    if (!currentUser) {
      handleOpenLoginWithRole('citizen');
    } else {
      setActiveView('my-reports');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenHowItWorks = () => {
    setActiveView('how-it-works');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSubmitted = (_complaint: CivicComplaint) => {
    // When complaint is submitted, optionally navigate to My Reports or remain on confirmation
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FF] text-[#071A2B]">
      {/* Sticky Modern Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onQuickReport={handleOpenCitizen}
        onLogout={handleLogout}
        onOpenLoginWithRole={handleOpenLoginWithRole}
      />

      {/* Main Content Area based on active view */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div className="space-y-0 animate-fadeIn">
            {/* Hero Section */}
            <HeroSection
              onSelectCitizen={handleOpenCitizen}
              onSelectGovernment={handleOpenGovernment}
              onExploreIssues={() => {
                const el = document.getElementById('common-issues-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Portal Selection Cards */}
            <PortalSelection
              onSelectCitizen={handleOpenCitizen}
              onSelectGovernment={handleOpenGovernment}
            />

            {/* How It Works 4-Step Timeline */}
            <HowItWorks />

            {/* Common Civic Issues */}
            <CommonIssues onSelectCategory={handleSelectCategoryFromHome} />
          </div>
        )}

        {activeView === 'citizen' && (
          !currentUser ? (
            <div className="animate-fadeIn">
              <AuthLanding
                defaultRole="citizen"
                onLoginSuccess={handleLogin}
                onCancel={() => setActiveView('home')}
              />
            </div>
          ) : currentUser.role !== 'citizen' ? (
            <div className="animate-fadeIn">
              <AccessDenied
                requiredRole="citizen"
                currentUser={currentUser}
                onSwitchAccount={(targetRole) => handleOpenLoginWithRole(targetRole)}
                onReturnToAllowed={() => setActiveView('government')}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              <CitizenPortal
                initialCategory={prefilledCategory}
                initialDescription={prefilledDescription}
                onComplaintSubmitted={handleComplaintSubmitted}
                onViewMyReports={handleOpenMyReports}
              />
            </div>
          )
        )}

        {activeView === 'government' && (
          !currentUser ? (
            <div className="animate-fadeIn">
              <AuthLanding
                defaultRole="government"
                onLoginSuccess={handleLogin}
                onCancel={() => setActiveView('home')}
              />
            </div>
          ) : currentUser.role !== 'government' ? (
            <div className="animate-fadeIn">
              <AccessDenied
                requiredRole="government"
                currentUser={currentUser}
                onSwitchAccount={(targetRole) => handleOpenLoginWithRole(targetRole)}
                onReturnToAllowed={() => setActiveView('citizen')}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              <GovernmentPortal onOpenCitizenPortal={handleOpenCitizen} />
            </div>
          )
        )}

        {activeView === 'my-reports' && (
          !currentUser ? (
            <div className="animate-fadeIn">
              <AuthLanding
                defaultRole="citizen"
                onLoginSuccess={handleLogin}
                onCancel={() => setActiveView('home')}
              />
            </div>
          ) : currentUser.role !== 'citizen' ? (
            <div className="animate-fadeIn">
              <AccessDenied
                requiredRole="citizen"
                currentUser={currentUser}
                onSwitchAccount={(targetRole) => handleOpenLoginWithRole(targetRole)}
                onReturnToAllowed={() => setActiveView('government')}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              <MyReports
                onNewReport={handleOpenCitizen}
                onSelectComplaint={(_c) => {
                  // If citizen selects a complaint, show detailed tracking or stay in view
                }}
              />
            </div>
          )
        )}

        {activeView === 'how-it-works' && (
          <div className="animate-fadeIn">
            <HowItWorks />
            <PortalSelection
              onSelectCitizen={handleOpenCitizen}
              onSelectGovernment={handleOpenGovernment}
            />
          </div>
        )}

        {activeView === 'login' && (
          <div className="animate-fadeIn">
            <AuthLanding
              currentUser={currentUser}
              defaultRole={loginDefaultRole}
              onLoginSuccess={handleLogin}
              onLogout={handleLogout}
              onCancel={() => setActiveView('home')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectView={(view) => {
        if (view === 'citizen') handleOpenCitizen();
        else if (view === 'government') handleOpenGovernment();
        else if (view === 'login') handleOpenLoginWithRole('citizen');
        else {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }} />
    </div>
  );
}
