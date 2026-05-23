import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { getJournalEntries, getJournalEntryByDate, saveJournalEntry, getDailyRoutineLogNew, getFoods, type JournalEntry, type Food } from "../lib/storage";
import { Calendar, Save, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

export function DailyJournal() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    date: selectedDate,
    restHours: 7,
    restQuality: 3,
    workout: false,
    stressLevel: 3,
    notes: '',
    herbsConsumed: [],
    foodsConsumed: []
  });
  const [foodsCatalog, setFoodsCatalog] = useState<Food[]>([]);

  useEffect(() => {
    const loadFoods = async () => {
      const foods = await getFoods();
      setFoodsCatalog(foods);
    };
    loadFoods();
  }, []);

  useEffect(() => {
    loadEntry(selectedDate);
  }, [selectedDate]);

  const loadEntry = async (date: string) => {
    const existingEntry = await getJournalEntryByDate(date);
    if (existingEntry) {
      setEntry(existingEntry);
    } else {
      setEntry({
        date,
        restHours: 7,
        restQuality: 3,
        workout: false,
        stressLevel: 3,
        notes: '',
        herbsConsumed: [],
        foodsConsumed: []
      });
    }
  };

  const handleSave = async () => {
    const journalEntry: JournalEntry = {
      id: entry.id || Date.now().toString(),
      date: selectedDate,
      restHours: entry.restHours || 7,
      restQuality: entry.restQuality || 3,
      workout: entry.workout || false,
      workoutType: entry.workoutType,
      workoutDuration: entry.workoutDuration,
      stressLevel: entry.stressLevel || 3,
      notes: entry.notes || '',
      herbsConsumed: entry.herbsConsumed || [],
      foodsConsumed: entry.foodsConsumed || []
    };

    await saveJournalEntry(journalEntry);
    alert('Entry saved successfully!');
  };

  const getQualityLabel = (value: number) => {
    const labels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    return labels[value - 1] || 'Fair';
  };

  const getStressLabel = (value: number) => {
    const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return labels[value - 1] || 'Moderate';
  };

  // Calculate daily lysine score from foods logged in Daily Routine
  const calculateLysineScore = async () => {
    const routineLog = await getDailyRoutineLogNew(selectedDate);

    if (!routineLog || routineLog.foods.length === 0) {
      return {
        score: 0,
        lysine: 0,
        arginine: 0,
        hasData: false,
        noRoutineLog: true
      };
    }

    let totalLysine = 0;
    let totalArginine = 0;
    let foundNutritionData = false;

    // Look up each food from the routine log in the foods catalog
    routineLog.foods.forEach(foodEntry => {
      const food = foodsCatalog.find(f =>
        f.name.toLowerCase() === foodEntry.name.toLowerCase()
      );

      if (food) {
        if (food.lysine) {
          totalLysine += food.lysine;
          foundNutritionData = true;
        }
        if (food.arginine) {
          totalArginine += food.arginine;
          foundNutritionData = true;
        }
      }
    });

    return {
      score: totalLysine - totalArginine,
      lysine: totalLysine,
      arginine: totalArginine,
      hasData: foundNutritionData,
      noRoutineLog: false
    };
  };

  const [lysineData, setLysineData] = useState({
    score: 0,
    lysine: 0,
    arginine: 0,
    hasData: false,
    noRoutineLog: true
  });

  useEffect(() => {
    const updateLysineData = async () => {
      const data = await calculateLysineScore();
      setLysineData(data);
    };
    updateLysineData();
  }, [selectedDate, foodsCatalog]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-800">Daily Journal</h2>
          <p className="text-gray-600">Track your daily wellness metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rest & Sleep</CardTitle>
            <CardDescription>How did you rest today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="restHours">Hours of Sleep: {entry.restHours}h</Label>
              <Slider
                id="restHours"
                min={0}
                max={12}
                step={0.5}
                value={[entry.restHours || 7]}
                onValueChange={([value]) => setEntry({ ...entry, restHours: value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="restQuality">Sleep Quality: {getQualityLabel(entry.restQuality || 3)}</Label>
              <Slider
                id="restQuality"
                min={1}
                max={5}
                step={1}
                value={[entry.restQuality || 3]}
                onValueChange={([value]) => setEntry({ ...entry, restQuality: value })}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout</CardTitle>
            <CardDescription>Did you exercise today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="workout">Worked out today</Label>
              <Switch
                id="workout"
                checked={entry.workout}
                onCheckedChange={(checked) => setEntry({ ...entry, workout: checked })}
              />
            </div>

            {entry.workout && (
              <>
                <div>
                  <Label htmlFor="workoutType">Type of Workout</Label>
                  <Input
                    id="workoutType"
                    value={entry.workoutType || ''}
                    onChange={(e) => setEntry({ ...entry, workoutType: e.target.value })}
                    placeholder="e.g., Yoga, Running, Weights"
                  />
                </div>

                <div>
                  <Label htmlFor="workoutDuration">Duration (minutes)</Label>
                  <Input
                    id="workoutDuration"
                    type="number"
                    value={entry.workoutDuration || ''}
                    onChange={(e) => setEntry({ ...entry, workoutDuration: parseInt(e.target.value) })}
                    placeholder="30"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stress Level</CardTitle>
            <CardDescription>How stressed did you feel?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stressLevel">Stress: {getStressLabel(entry.stressLevel || 3)}</Label>
              <Slider
                id="stressLevel"
                min={1}
                max={5}
                step={1}
                value={[entry.stressLevel || 3]}
                onValueChange={([value]) => setEntry({ ...entry, stressLevel: value })}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Any additional thoughts?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={entry.notes || ''}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
              placeholder="How are you feeling? Any insights or observations..."
              rows={6}
            />
          </CardContent>
        </Card>
      </div>

      {lysineData.noRoutineLog ? (
        <Card>
          <CardHeader>
            <CardTitle>Daily Lysine Score</CardTitle>
            <CardDescription>Track your lysine vs arginine ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-gray-600">
                No foods logged in Daily Routine for this date. Track your food intake in the Daily Routine tab to see your lysine score here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : lysineData.hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Daily Lysine Score
              {lysineData.score > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </CardTitle>
            <CardDescription>Track your lysine vs arginine ratio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lysineData.score > 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Positive lysine score! You're on track with {lysineData.score.toFixed(2)} mg surplus.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Negative lysine score. Consider adding more lysine-rich foods. Current deficit: {Math.abs(lysineData.score).toFixed(2)} mg
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600">Total Lysine</div>
                <div className="text-blue-900">{lysineData.lysine.toFixed(2)} mg</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-orange-600">Total Arginine</div>
                <div className="text-orange-900">{lysineData.arginine.toFixed(2)} mg</div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Tip: A positive lysine score means you're consuming more lysine than arginine, which is beneficial for healing.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Entry
        </Button>
      </div>
    </div>
  );
}