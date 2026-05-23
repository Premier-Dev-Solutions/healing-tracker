import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getHerbs, getFoods, getJournalEntries, type JournalEntry } from "../lib/storage";
import { Activity, Leaf, Moon, TrendingUp, Zap } from "lucide-react";
import { Progress } from "./ui/progress";

export function Dashboard() {
  const [stats, setStats] = useState({
    totalHerbsFoods: 0,
    recentEntries: 0,
    avgSleep: 0,
    avgStress: 0,
    workoutStreak: 0,
    consistencyRate: 0
  });

  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = async () => {
    const [herbs, foods, entries] = await Promise.all([
      getHerbs(),
      getFoods(),
      getJournalEntries()
    ]);
    const totalHerbsFoods = herbs.length + foods.length;
    
    // Get last 7 days of entries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEntries = entries.filter(e => new Date(e.date) >= sevenDaysAgo);
    const sortedRecent = [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    // Calculate averages
    const avgSleep = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.restHours, 0) / recentEntries.length
      : 0;
    
    const avgStress = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.stressLevel, 0) / recentEntries.length
      : 0;

    // Calculate workout streak
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let workoutStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime() && sortedEntries[i].workout) {
        workoutStreak++;
      } else {
        break;
      }
    }

    // Consistency rate (entries in last 7 days)
    const consistencyRate = (recentEntries.length / 7) * 100;

    setStats({
      totalHerbsFoods,
      recentEntries: recentEntries.length,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      workoutStreak,
      consistencyRate: Math.round(consistencyRate)
    });

    setRecentEntries(sortedRecent);
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return "text-green-600";
    if (level <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Herbs & Foods</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-green-700">{stats.totalHerbsFoods}</div>
            <p className="text-xs text-gray-600 mt-1">Items in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Sleep</CardTitle>
            <Moon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-700">{stats.avgSleep}h</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Stress</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={getStressColor(stats.avgStress)}>{stats.avgStress}/5</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Workout Streak</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-purple-700">{stats.workoutStreak} days</div>
            <p className="text-xs text-gray-600 mt-1">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Consistency</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-teal-700">{stats.consistencyRate}%</div>
            <Progress value={stats.consistencyRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Entries</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-700">{stats.recentEntries}</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Journal Entries</CardTitle>
          <CardDescription>Your latest tracking entries</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No journal entries yet. Start tracking your journey!</p>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-700">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3 h-3" /> {entry.restHours}h
                      </span>
                      {entry.workout && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Activity className="w-3 h-3" /> {entry.workoutType}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 ${getStressColor(entry.stressLevel)}`}>
                        <Zap className="w-3 h-3" /> Stress: {entry.stressLevel}
                      </span>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
