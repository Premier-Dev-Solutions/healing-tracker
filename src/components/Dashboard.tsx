import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getHerbs, getFoods, getJournalEntries, getDailyRoutineLogNew, type JournalEntry } from "../lib/storage";
import { Activity, CalendarCheck, ChevronRight, Leaf, Moon, TrendingUp, Zap } from "lucide-react";
import { Progress } from "./ui/progress";
import { format } from "date-fns";

interface DashboardProps {
  onNavigate: (tab: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalHerbs: 0,
    totalFoods: 0,
    avgSleep: 0,
    avgStress: 0,
    workoutStreak: 0,
    consistencyRate: 0
  });
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [routineHerbCount, setRoutineHerbCount] = useState<number | null>(null);

  useEffect(() => {
    calculateStats();
    loadTodayRoutine();
  }, []);

  const loadTodayRoutine = async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const log = await getDailyRoutineLogNew(todayStr);
    if (log && log.herbsTeas.length > 0) {
      setRoutineHerbCount(log.herbsTeas.length);
    } else {
      setRoutineHerbCount(null);
    }
  };

  const calculateStats = async () => {
    const [herbs, foods, entries] = await Promise.all([
      getHerbs(),
      getFoods(),
      getJournalEntries()
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = entries.filter(e => new Date(e.date + 'T00:00:00') >= sevenDaysAgo);
    const sortedRecent = [...entries]
      .sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime())
      .slice(0, 5);

    const avgSleep = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.restHours, 0) / recentEntries.length
      : 0;

    const avgStress = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.stressLevel, 0) / recentEntries.length
      : 0;

    const sortedEntries = [...entries].sort((a, b) =>
      new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime()
    );

    let workoutStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date + 'T00:00:00');
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime() && sortedEntries[i].workout) {
        workoutStreak++;
      } else {
        break;
      }
    }

    const consistencyRate = (recentEntries.length / 7) * 100;

    setStats({
      totalHerbs: herbs.length,
      totalFoods: foods.length,
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning 🌿" : hour < 17 ? "Good afternoon 🌿" : "Good evening 🌿";
  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  const routineSubtitle = routineHerbCount === null
    ? "Not started today"
    : `${routineHerbCount} herb${routineHerbCount !== 1 ? 's' : ''} logged today`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Date greeting */}
      <div>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px', margin: 0 }}>{todayLabel}</p>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '4px 0 0 0' }}>{greeting}</h2>
      </div>

      {/* Daily routine banner */}
      <div
        onClick={() => onNavigate("routine")}
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          backgroundColor: '#16a34a',
          borderRadius: '8px',
          padding: '8px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CalendarCheck style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', color: '#15803d', margin: 0, fontSize: '15px' }}>Daily routine</p>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0 0' }}>{routineSubtitle}</p>
        </div>
        <ChevronRight style={{ width: '18px', height: '18px', color: '#16a34a', flexShrink: 0 }} />
      </div>

      {/* 2-column stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
        <Card onClick={() => onNavigate("herbs")} style={{ cursor: 'pointer' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Herbs</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Leaf className="h-4 w-4 text-green-600" />
              <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-green-700">{stats.totalHerbs}</div>
            <p className="text-xs text-gray-600 mt-1">In catalog</p>
          </CardContent>
        </Card>

        <Card onClick={() => onNavigate("foods")} style={{ cursor: 'pointer' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Foods</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity className="h-4 w-4 text-emerald-600" />
              <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-700">{stats.totalFoods}</div>
            <p className="text-xs text-gray-600 mt-1">In catalog</p>
          </CardContent>
        </Card>

        <Card onClick={() => onNavigate("journal")} style={{ cursor: 'pointer' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Sleep</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Moon className="h-4 w-4 text-blue-600" />
              <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-blue-700">{stats.avgSleep}h</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card onClick={() => onNavigate("journal")} style={{ cursor: 'pointer' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Stress</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap className="h-4 w-4 text-orange-600" />
              <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={getStressColor(stats.avgStress)}>{stats.avgStress}/5</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card onClick={() => onNavigate("consistency")} style={{ cursor: 'pointer' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Consistency</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-teal-700">{stats.consistencyRate}%</div>
            <Progress value={stats.consistencyRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card onClick={() => onNavigate("journal")} style={{ cursor: 'pointer' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Workout Streak</CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity className="h-4 w-4 text-purple-600" />
              <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-purple-700">{stats.workoutStreak} days</div>
            <p className="text-xs text-gray-600 mt-1">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent journal entries */}
      <Card>
        <CardHeader>
          <div
            onClick={() => onNavigate("journal")}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>Your latest tracking entries</CardDescription>
            </div>
            <ChevronRight style={{ width: '18px', height: '18px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
          </div>
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
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
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
