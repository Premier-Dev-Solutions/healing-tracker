import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getJournalEntries, type JournalEntry } from "../lib/storage";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { Activity, Moon, Zap } from "lucide-react";

export function ConsistencyTracker() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      setSelectedEntry(entry || null);
    }
  }, [selectedDate, entries]);

  const loadEntries = async () => {
    const allEntries = await getJournalEntries();
    setEntries(allEntries);

    const dates = new Set(allEntries.map(e => e.date));
    setEntryDates(dates);
  };

  const getStreakInfo = () => {
    if (entries.length === 0) return { current: 0, longest: 0 };

    const sortedEntries = [...entries].sort((a, b) =>
      new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date + 'T00:00:00');
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    const allDates = entries.map(e => new Date(e.date + 'T00:00:00').getTime()).sort((a, b) => a - b);
    
    for (let i = 0; i < allDates.length; i++) {
      if (i === 0 || allDates[i] - allDates[i - 1] === 86400000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const getConsistencyRate = (days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const recentEntries = entries.filter(e => new Date(e.date + 'T00:00:00') >= startDate);
    return Math.round((recentEntries.length / days) * 100);
  };

  const streakInfo = getStreakInfo();
  const weeklyConsistency = getConsistencyRate(7);
  const monthlyConsistency = getConsistencyRate(30);

  const modifiers = {
    hasEntry: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return entryDates.has(dateStr);
    }
  };

  const modifiersStyles = {
    hasEntry: {
      backgroundColor: 'rgb(34 197 94)',
      color: 'white',
      borderRadius: '50%'
    }
  };

  const getQualityLabel = (value: number) => {
    const labels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    return labels[value - 1] || 'Fair';
  };

  const getStressLabel = (value: number) => {
    const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return labels[value - 1] || 'Moderate';
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800">Consistency Tracker</h2>
        <p className="text-gray-600">Monitor your tracking habits and streaks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
            <CardDescription>Consecutive days tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-green-700">{streakInfo.current} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Longest Streak</CardTitle>
            <CardDescription>Your personal best</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-blue-700">{streakInfo.longest} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Entries</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-purple-700">{entries.length} entries</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Consistency</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-teal-700">{weeklyConsistency}%</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${weeklyConsistency}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Consistency</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-indigo-700">{monthlyConsistency}%</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${monthlyConsistency}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Days with entries are highlighted in green</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }) : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedEntry ? 'Entry details' : 'No entry for this date'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEntry ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Moon className="w-4 h-4 text-blue-600" />
                      <span>Sleep: {selectedEntry.restHours}h</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Quality: {getQualityLabel(selectedEntry.restQuality)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span>Workout: {selectedEntry.workout ? 'Yes' : 'No'}</span>
                    </div>
                    {selectedEntry.workout && selectedEntry.workoutType && (
                      <div className="text-xs text-gray-600">
                        {selectedEntry.workoutType}
                        {selectedEntry.workoutDuration && ` - ${selectedEntry.workoutDuration}min`}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span>Stress Level: {getStressLabel(selectedEntry.stressLevel)}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= selectedEntry.stressLevel
                            ? getStressColor(selectedEntry.stressLevel)
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-700">{selectedEntry.notes}</p>
                  </div>
                )}

                {(selectedEntry.herbsConsumed.length > 0 || selectedEntry.foodsConsumed.length > 0) && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm">Items consumed:</p>
                    <div className="flex flex-wrap gap-1">
                      {[...selectedEntry.herbsConsumed, ...selectedEntry.foodsConsumed].map((itemId, idx) => (
                        <Badge key={idx} variant="secondary">{itemId}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No journal entry recorded for this date
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
