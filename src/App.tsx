import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dashboard } from "./components/Dashboard";
import { HerbsAndFoods } from "./components/HerbsAndFoods";
import { DailyJournal } from "./components/DailyJournal";
import { DailyRoutine } from "./components/DailyRoutine";
import { ConsistencyTracker } from "./components/ConsistencyTracker";
import { TestingTracker } from "./components/TestingTracker";
import { OutbreakTracker } from "./components/OutbreakTracker";
import { Settings } from "./components/Settings";
import { Activity, Leaf, BookOpen, Calendar, Stethoscope, ClipboardList, AlertCircle, Settings as SettingsIcon } from "lucide-react";
import { autoMigrate } from "./lib/migration";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Auto-migrate localStorage data to IndexedDB on first load
    autoMigrate().catch(error => {
      console.error('Migration error:', error);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-green-700 mb-2">Healing Journey Tracker</h1>
          <p className="text-gray-600">Track your wellness path with intention</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-auto !inline-grid grid-cols-8 gap-1 mb-8 !p-1">
            <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="herbs" className="flex items-center justify-center gap-2">
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Herbs & Foods</span>
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
            <HerbsAndFoods />
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
      </div>
    </div>
  );
}