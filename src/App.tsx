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
import { Activity, BookOpen, Calendar, Stethoscope, ClipboardList, AlertCircle, Settings as SettingsIcon, Pill, Store, Apple } from "lucide-react";
import { autoMigrate } from "./lib/migration";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Auto-migrate localStorage data to IndexedDB on first load
    autoMigrate().catch(error => {
      console.error('Migration error:', error);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <img src="/Transparent Logo.svg" alt="Heal From It" style={{ width: '400px', height: 'auto' }} />
          <SyncStatus onSignInClick={() => setShowAuthModal(true)} />
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-auto !inline-grid grid-cols-10 gap-1 mb-8 !p-1">
            <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="herbs" className="flex items-center justify-center gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Herbs</span>
            </TabsTrigger>
            <TabsTrigger value="foods" className="flex items-center justify-center gap-2">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Foods</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center justify-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="routine" className="flex items-center justify-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Daily Routine</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="outbreaks" className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Outbreaks</span>
            </TabsTrigger>
            <TabsTrigger value="consistency" className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Consistency</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center justify-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Testing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

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
        </Tabs>

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