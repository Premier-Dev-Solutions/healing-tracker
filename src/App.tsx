import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dashboard } from "./components/Dashboard";
import { Herbs } from "./components/Herbs";
import { Foods } from "./components/Foods";
import { Suppliers } from "./components/Suppliers";
import { DailyJournal } from "./components/DailyJournal";
import { DailyRoutine } from "./components/DailyRoutine";
import { ConsistencyTracker } from "./components/ConsistencyTracker";
import { TestingTracker } from "./components/TestingTracker";
import { OutbreakTracker } from "./components/OutbreakTracker";
import { Settings } from "./components/Settings";
import { Auth } from "./components/Auth";
import { SyncStatus } from "./components/SyncStatus";
import { AuthProvider } from "./stores/AuthProvider";
import { Activity, BookOpen, Calendar, Stethoscope, ClipboardList, AlertCircle, Settings as SettingsIcon, Pill, Store, Apple, LayoutDashboard, Leaf, Menu, X, Truck, CalendarCheck } from "lucide-react";
import { autoMigrate } from "./lib/migration";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "./stores/authStore";
import { signOut } from "./lib/auth";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Auto-migrate localStorage data to IndexedDB on first load
    autoMigrate().catch(error => {
      console.error('Migration error:', error);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4' }}>
      {/* Mobile Header — outside container, pinned to top */}
      {isMobile && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#f0fdf4',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px'
          }}
        >
          {/* Left: Logo + App Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo.png"
              alt="Heal From It"
              style={{ width: '36px', height: '36px', borderRadius: '8px' }}
            />
            <span
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#111827',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '-0.01em',
                textTransform: 'uppercase'
              }}
            >
              Heal From It
            </span>
          </div>

          {/* Right: Sync Dot + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isAuthenticated ? '#16a34a' : '#9ca3af'
              }}
            />
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Open menu"
            >
              <Menu style={{ width: '24px', height: '24px', color: '#4b5563' }} />
            </button>
          </div>
        </header>
      )}

      {/* Desktop Header — only shows when not mobile */}
      {!isMobile && (
        <div style={{ padding: '2rem 1rem 0' }}>
          <div className="container mx-auto max-w-7xl">
            <header className="mb-8 flex flex-col items-center sm:flex-row sm:justify-between p-4">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <img src="/Transparent Logo.svg" alt="Heal From It" style={{ width: '400px', height: 'auto' }} />
              </div>
              <div className="flex items-center justify-center sm:justify-end mt-2 sm:mt-0 gap-2">
                <SyncStatus onSignInClick={() => setShowAuthModal(true)} />
              </div>
            </header>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          padding: isMobile ? '16px 16px 80px' : '0 1rem 2rem',
          maxWidth: '80rem',
          margin: '0 auto'
        }}
      >

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop tab bar */}
          {!isMobile && (
            <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-8">
              <TabsList className="w-auto !inline-flex gap-1 !p-1 min-w-max">
              <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="herbs" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <Pill className="w-4 h-4" />
                <span className="hidden sm:inline">Herbs</span>
              </TabsTrigger>
              <TabsTrigger value="foods" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <Apple className="w-4 h-4" />
                <span className="hidden sm:inline">Foods</span>
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Suppliers</span>
              </TabsTrigger>
              <TabsTrigger value="routine" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Daily Routine</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="outbreaks" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Outbreaks</span>
              </TabsTrigger>
              <TabsTrigger value="consistency" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Consistency</span>
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">Testing</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px]">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
            </div>
          )}

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="herbs">
            <Herbs />
          </TabsContent>

          <TabsContent value="foods">
            <Foods />
          </TabsContent>

          <TabsContent value="suppliers">
            <Suppliers />
          </TabsContent>

          <TabsContent value="routine">
            <DailyRoutine />
          </TabsContent>

          <TabsContent value="journal">
            <DailyJournal />
          </TabsContent>

          <TabsContent value="consistency">
            <ConsistencyTracker />
          </TabsContent>

          <TabsContent value="outbreaks">
            <OutbreakTracker />
          </TabsContent>

          <TabsContent value="testing">
            <TestingTracker />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>

          {/* Mobile bottom navigation bar */}
          {isMobile && (
            <nav
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e5e7eb',
                display: 'flex'
              }}
            >
              <button
                onClick={() => setActiveTab("dashboard")}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px 10px',
                  gap: '3px',
                  minHeight: '56px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'dashboard' ? '#16a34a' : '#9ca3af'
                }}
              >
                <LayoutDashboard style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '9px', marginTop: '2px' }}>Home</span>
              </button>
              <button
                onClick={() => setActiveTab("herbs")}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px 10px',
                  gap: '3px',
                  minHeight: '56px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'herbs' ? '#16a34a' : '#9ca3af'
                }}
              >
                <Leaf style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '9px', marginTop: '2px' }}>Herbs</span>
              </button>
              <button
                onClick={() => setActiveTab("routine")}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px 10px',
                  gap: '3px',
                  minHeight: '56px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'routine' ? '#16a34a' : '#9ca3af'
                }}
              >
                <Calendar style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '9px', marginTop: '2px' }}>Daily</span>
              </button>
              <button
                onClick={() => setActiveTab("journal")}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px 10px',
                  gap: '3px',
                  minHeight: '56px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'journal' ? '#16a34a' : '#9ca3af'
                }}
              >
                <BookOpen style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '9px', marginTop: '2px' }}>Journal</span>
              </button>
              <button
                onClick={() => setActiveTab("foods")}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px 10px',
                  gap: '3px',
                  minHeight: '56px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'foods' ? '#16a34a' : '#9ca3af'
                }}
              >
                <Apple style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '9px', marginTop: '2px' }}>Foods</span>
              </button>
            </nav>
          )}
        </Tabs>

        {/* Mobile drawer */}
        {drawerOpen && isMobile && (
          <>
            {/* Overlay */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 9998
              }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer panel */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100%',
                width: '200px',
                backgroundColor: '#ffffff',
                borderLeft: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999,
                overflowY: 'auto'
              }}
            >
              {/* Drawer header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  aria-label="Close menu"
                >
                  <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>

              {/* Drawer content */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* CATALOG section */}
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <h3
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '4px 16px',
                      margin: 0
                    }}
                  >
                    Catalog
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab("suppliers");
                      setDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f9fafb',
                      background: activeTab === 'suppliers' ? '#f0fdf4' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Truck
                      style={{
                        width: '18px',
                        height: '18px',
                        color: activeTab === 'suppliers' ? '#16a34a' : '#6b7280',
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: activeTab === 'suppliers' ? '#16a34a' : '#111827',
                        fontWeight: activeTab === 'suppliers' ? '500' : '400'
                      }}
                    >
                      Suppliers
                    </span>
                  </button>
                </div>

                {/* HEALTH section */}
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <h3
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '4px 16px',
                      margin: 0
                    }}
                  >
                    Health
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab("outbreaks");
                      setDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f9fafb',
                      background: activeTab === 'outbreaks' ? '#f0fdf4' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Activity
                      style={{
                        width: '18px',
                        height: '18px',
                        color: activeTab === 'outbreaks' ? '#16a34a' : '#6b7280',
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: activeTab === 'outbreaks' ? '#16a34a' : '#111827',
                        fontWeight: activeTab === 'outbreaks' ? '500' : '400'
                      }}
                    >
                      Outbreaks
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("testing");
                      setDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f9fafb',
                      background: activeTab === 'testing' ? '#f0fdf4' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Stethoscope
                      style={{
                        width: '18px',
                        height: '18px',
                        color: activeTab === 'testing' ? '#16a34a' : '#6b7280',
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: activeTab === 'testing' ? '#16a34a' : '#111827',
                        fontWeight: activeTab === 'testing' ? '500' : '400'
                      }}
                    >
                      Testing
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("consistency");
                      setDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f9fafb',
                      background: activeTab === 'consistency' ? '#f0fdf4' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <CalendarCheck
                      style={{
                        width: '18px',
                        height: '18px',
                        color: activeTab === 'consistency' ? '#16a34a' : '#6b7280',
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: activeTab === 'consistency' ? '#16a34a' : '#111827',
                        fontWeight: activeTab === 'consistency' ? '500' : '400'
                      }}
                    >
                      Consistency
                    </span>
                  </button>
                </div>

                {/* APP section */}
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <h3
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '4px 16px',
                      margin: 0
                    }}
                  >
                    App
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f9fafb',
                      background: activeTab === 'settings' ? '#f0fdf4' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <SettingsIcon
                      style={{
                        width: '18px',
                        height: '18px',
                        color: activeTab === 'settings' ? '#16a34a' : '#6b7280',
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: activeTab === 'settings' ? '#16a34a' : '#111827',
                        fontWeight: activeTab === 'settings' ? '500' : '400'
                      }}
                    >
                      Settings
                    </span>
                  </button>
                </div>
              </div>

              {/* Drawer footer */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '16px',
                  borderTop: '1px solid #f3f4f6'
                }}
              >
                {isAuthenticated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      Synced
                    </div>
                    <button
                      onClick={async () => {
                        await signOut();
                        setDrawerOpen(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#ef4444',
                        padding: 0,
                        textAlign: 'left',
                        marginTop: '4px'
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setDrawerOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#16a34a',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Sign in to sync →
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {showAuthModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowAuthModal(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '32px',
                width: '100%',
                maxWidth: '420px',
                margin: '0 16px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
              <Auth onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
      <Analytics />
    </AuthProvider>
  );
}