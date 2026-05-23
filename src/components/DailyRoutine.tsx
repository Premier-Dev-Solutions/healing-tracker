import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  getDailyRoutineLogNew,
  saveDailyRoutineLogNew,
  getHerbs,
  type DailyRoutineLogNew,
  type PillIntake,
  type HerbTeaIntake,
  type FoodIntake,
  type Herb
} from "../lib/storage";
import { Plus, Trash2, Pill, Coffee, Apple, Calendar, ChevronLeft, ChevronRight, AlertTriangle, Info } from "lucide-react";

export function DailyRoutine() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyLog, setDailyLog] = useState<DailyRoutineLogNew | null>(null);
  const [fasting, setFasting] = useState<boolean>(false);
  const [fastingHours, setFastingHours] = useState<string>("");
  const [herbsCatalog, setHerbsCatalog] = useState<Herb[]>([]);

  // Pill state
  const [isPillDialogOpen, setIsPillDialogOpen] = useState(false);
  const [pillTime, setPillTime] = useState("");
  const [pillSupplier, setPillSupplier] = useState("");
  const [pillName, setPillName] = useState("");
  const [pillIngredients, setPillIngredients] = useState("");
  const [pillQuantity, setPillQuantity] = useState("1");

  // Herb/Tea state
  const [isHerbDialogOpen, setIsHerbDialogOpen] = useState(false);
  const [herbTime, setHerbTime] = useState("");
  const [herbServingSize, setHerbServingSize] = useState("");
  const [herbWhatWasInIt, setHerbWhatWasInIt] = useState("");
  const [herbIngredients, setHerbIngredients] = useState<{ name: string; supplier: string }[]>([{ name: "", supplier: "" }]);

  // Food state
  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false);
  const [foodTime, setFoodTime] = useState("");
  const [foodName, setFoodName] = useState("");
  const [foodServingSize, setFoodServingSize] = useState("");
  const [foodNotes, setFoodNotes] = useState("");

  useEffect(() => {
    loadHerbsCatalog();
    loadDailyLog(selectedDate);
  }, []);

  useEffect(() => {
    loadDailyLog(selectedDate);
  }, [selectedDate]);

  const loadHerbsCatalog = async () => {
    const herbs = await getHerbs();
    setHerbsCatalog(herbs);
  };

  const loadDailyLog = async (date: string) => {
    const log = await getDailyRoutineLogNew(date);
    if (log) {
      setDailyLog(log);
      setFasting(log.fasting);
      setFastingHours(log.fastingHours?.toString() || "");
    } else {
      setDailyLog({
        date,
        fasting: false,
        pills: [],
        herbsTeas: [],
        foods: []
      });
      setFasting(false);
      setFastingHours("");
    }
  };

  const saveFastingStatus = async () => {
    const log = dailyLog || {
      date: selectedDate,
      fasting: false,
      pills: [],
      herbsTeas: [],
      foods: []
    };

    log.fasting = fasting;
    log.fastingHours = fasting && fastingHours ? parseFloat(fastingHours) : undefined;

    await saveDailyRoutineLogNew(log);
    setDailyLog(log);
  };

  const handleAddPill = async () => {
    if (!pillTime || !pillName) return;

    const pill: PillIntake = {
      id: Date.now().toString(),
      time: pillTime,
      supplier: pillSupplier,
      pillName,
      ingredients: pillIngredients,
      quantity: parseInt(pillQuantity) || 1
    };

    const log = dailyLog || {
      date: selectedDate,
      fasting: false,
      pills: [],
      herbsTeas: [],
      foods: []
    };

    log.pills.push(pill);
    await saveDailyRoutineLogNew(log);
    setDailyLog(log);

    // Reset form
    setPillTime("");
    setPillSupplier("");
    setPillName("");
    setPillIngredients("");
    setPillQuantity("1");
    setIsPillDialogOpen(false);
  };

  const handleAddHerbTea = async () => {
    if (!herbTime || !herbWhatWasInIt) return;

    const herb: HerbTeaIntake = {
      id: Date.now().toString(),
      time: herbTime,
      servingSize: herbServingSize,
      whatWasInIt: herbWhatWasInIt,
      ingredients: herbIngredients.filter(i => i.name && i.supplier)
    };

    const log = dailyLog || {
      date: selectedDate,
      fasting: false,
      pills: [],
      herbsTeas: [],
      foods: []
    };

    log.herbsTeas.push(herb);
    await saveDailyRoutineLogNew(log);
    setDailyLog(log);

    // Reset form
    setHerbTime("");
    setHerbServingSize("");
    setHerbWhatWasInIt("");
    setHerbIngredients([{ name: "", supplier: "" }]);
    setIsHerbDialogOpen(false);
  };

  const handleAddFood = async () => {
    if (!foodTime || !foodName) return;

    const food: FoodIntake = {
      id: Date.now().toString(),
      time: foodTime,
      foodName,
      servingSize: foodServingSize || undefined,
      notes: foodNotes || undefined
    };

    const log = dailyLog || {
      date: selectedDate,
      fasting: false,
      pills: [],
      herbsTeas: [],
      foods: []
    };

    log.foods.push(food);
    await saveDailyRoutineLogNew(log);
    setDailyLog(log);

    // Reset form
    setFoodTime("");
    setFoodName("");
    setFoodServingSize("");
    setFoodNotes("");
    setIsFoodDialogOpen(false);
  };

  const deletePill = async (id: string) => {
    if (!dailyLog) return;
    dailyLog.pills = dailyLog.pills.filter(p => p.id !== id);
    await saveDailyRoutineLogNew(dailyLog);
    setDailyLog({ ...dailyLog });
  };

  const deleteHerbTea = async (id: string) => {
    if (!dailyLog) return;
    dailyLog.herbsTeas = dailyLog.herbsTeas.filter(h => h.id !== id);
    await saveDailyRoutineLogNew(dailyLog);
    setDailyLog({ ...dailyLog });
  };

  const deleteFood = async (id: string) => {
    if (!dailyLog) return;
    dailyLog.foods = dailyLog.foods.filter(f => f.id !== id);
    await saveDailyRoutineLogNew(dailyLog);
    setDailyLog({ ...dailyLog });
  };

  const checkHerbRequirements = () => {
    if (!dailyLog) return [];

    const warnings: string[] = [];

    herbsCatalog.forEach(herb => {
      if (herb.dailyAmount) {
        // Parse daily requirement from string like "3 Cups Daily" or "2 servings daily"
        const match = herb.dailyAmount.match(/(\d+)/);
        const requiredServings = match ? parseInt(match[1]) : 0;

        if (requiredServings > 0) {
          const count = dailyLog.herbsTeas.filter(h =>
            h.whatWasInIt.toLowerCase().includes(herb.name.toLowerCase()) ||
            h.ingredients.some(i => i.name.toLowerCase().includes(herb.name.toLowerCase()))
          ).length;

          if (count < requiredServings) {
            warnings.push(`${herb.name}: ${count}/${requiredServings} servings (need ${requiredServings - count} more)`);
          }
        }
      }
    });

    return warnings;
  };

  const getMatchingHerb = (herbName: string): Herb | undefined => {
    return herbsCatalog.find(herb =>
      herbName.toLowerCase().includes(herb.name.toLowerCase())
    );
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const warnings = checkHerbRequirements();
  const canAddFood = !fasting || (fasting && parseFloat(fastingHours) < 24);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-800">Daily Routine</h2>
          <p className="text-gray-600">Track your daily healing routine</p>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <CardTitle className="flex items-center gap-2 justify-center">
                <Calendar className="w-5 h-5" />
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              {!isToday && (
                <Button variant="link" size="sm" onClick={goToToday} className="mt-1">
                  Go to Today
                </Button>
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="mb-2">Daily herb requirements not met:</p>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, i) => (
                <li key={i} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Fasting */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Fasting</CardTitle>
          <CardDescription>Did you fast today?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={fasting ? "default" : "outline"}
              onClick={() => {
                setFasting(true);
                setFastingHours("");
              }}
            >
              Yes
            </Button>
            <Button
              variant={!fasting ? "default" : "outline"}
              onClick={() => {
                setFasting(false);
                setFastingHours("");
              }}
            >
              No
            </Button>
          </div>

          {fasting && (
            <div>
              <Label htmlFor="fastingHours">How many hours?</Label>
              <Input
                id="fastingHours"
                type="number"
                step="0.5"
                value={fastingHours}
                onChange={(e) => setFastingHours(e.target.value)}
                placeholder="e.g., 16, 24"
                className="max-w-xs"
              />
            </div>
          )}

          <Button onClick={saveFastingStatus}>Save Fasting Status</Button>

          {dailyLog && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm">
                <strong>Status:</strong> {dailyLog.fasting ? `Fasting ${dailyLog.fastingHours ? `(${dailyLog.fastingHours} hours)` : ''}` : 'Not fasting'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Pills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step 2: Pills</CardTitle>
              <CardDescription>Track pills taken today</CardDescription>
            </div>
            <Dialog open={isPillDialogOpen} onOpenChange={setIsPillDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pill Intake</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pillTime">Time</Label>
                    <Input
                      id="pillTime"
                      type="time"
                      value={pillTime}
                      onChange={(e) => setPillTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pillSupplier">Supplier</Label>
                    <Select value={pillSupplier} onValueChange={setPillSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bolingo Balance">Bolingo Balance</SelectItem>
                        <SelectItem value="Palm International">Palm International</SelectItem>
                        <SelectItem value="Herbology">Herbology</SelectItem>
                        <SelectItem value="Eat To Live">Eat To Live</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pillName">Pill Name</Label>
                    <Input
                      id="pillName"
                      value={pillName}
                      onChange={(e) => setPillName(e.target.value)}
                      placeholder="e.g., Vitamin D3"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pillIngredients">What's in it</Label>
                    <Textarea
                      id="pillIngredients"
                      value={pillIngredients}
                      onChange={(e) => setPillIngredients(e.target.value)}
                      placeholder="List ingredients..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="pillQuantity">How many pills</Label>
                    <Input
                      id="pillQuantity"
                      type="number"
                      value={pillQuantity}
                      onChange={(e) => setPillQuantity(e.target.value)}
                      min="1"
                    />
                  </div>
                  <Button onClick={handleAddPill} className="w-full">Add Pill</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {dailyLog && dailyLog.pills.length > 0 ? (
            <div className="space-y-2">
              {dailyLog.pills.map(pill => (
                <div key={pill.id} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Pill className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm">{pill.pillName}</p>
                      <Badge variant="outline" className="text-xs">{pill.time}</Badge>
                      <Badge className="text-xs">x{pill.quantity}</Badge>
                    </div>
                    {pill.supplier && <p className="text-xs text-gray-600">Supplier: {pill.supplier}</p>}
                    {pill.ingredients && <p className="text-xs text-gray-600">Ingredients: {pill.ingredients}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePill(pill.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No pills logged yet</p>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Herbs/Teas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step 3: Herbs & Teas</CardTitle>
              <CardDescription>Track herbal teas and drinks</CardDescription>
            </div>
            <Dialog open={isHerbDialogOpen} onOpenChange={setIsHerbDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Herb/Tea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Herb/Tea Intake</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="herbTime">Time</Label>
                    <Input
                      id="herbTime"
                      type="time"
                      value={herbTime}
                      onChange={(e) => setHerbTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="herbServingSize">Serving Size</Label>
                    <Input
                      id="herbServingSize"
                      value={herbServingSize}
                      onChange={(e) => setHerbServingSize(e.target.value)}
                      placeholder="e.g., 1 cup, 2 cups"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="herbWhatWasInIt">What was it / What was in it</Label>
                    <Input
                      id="herbWhatWasInIt"
                      value={herbWhatWasInIt}
                      onChange={(e) => setHerbWhatWasInIt(e.target.value)}
                      placeholder="e.g., Una Del Gato Tea"
                      required
                    />
                  </div>

                  {/* Show preparation instructions and requirements if herb is in catalog */}
                  {(() => {
                    const matchedHerb = getMatchingHerb(herbWhatWasInIt);
                    if (matchedHerb) {
                      return (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <p className="text-sm mb-2"><strong>{matchedHerb.name}</strong></p>
                            {matchedHerb.preparationInstructions && (
                              <p className="text-xs mb-2">{matchedHerb.preparationInstructions}</p>
                            )}
                            {matchedHerb.serving && (
                              <p className="text-xs mb-1">Serving Size: {matchedHerb.serving}</p>
                            )}
                            {matchedHerb.dailyAmount && (
                              <p className="text-xs text-blue-600">
                                Required: {matchedHerb.dailyAmount}
                              </p>
                            )}
                            {matchedHerb.supplier && (
                              <p className="text-xs mt-1 text-gray-600">
                                Supplier: {matchedHerb.supplier}
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      );
                    }
                    return null;
                  })()}

                  <div>
                    <Label>Ingredients & Suppliers</Label>
                    {herbIngredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) => {
                            const newIngredients = [...herbIngredients];
                            newIngredients[index].name = e.target.value;
                            setHerbIngredients(newIngredients);
                          }}
                        />
                        <Select
                          value={ingredient.supplier}
                          onValueChange={(value) => {
                            const newIngredients = [...herbIngredients];
                            newIngredients[index].supplier = value;
                            setHerbIngredients(newIngredients);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bolingo Balance">Bolingo Balance</SelectItem>
                            <SelectItem value="Palm International">Palm International</SelectItem>
                            <SelectItem value="Herbology">Herbology</SelectItem>
                            <SelectItem value="Eat To Live">Eat To Live</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHerbIngredients([...herbIngredients, { name: "", supplier: "" }])}
                    >
                      + Add Ingredient
                    </Button>
                  </div>

                  <Button onClick={handleAddHerbTea} className="w-full">Add Herb/Tea</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {dailyLog && dailyLog.herbsTeas.length > 0 ? (
            <div className="space-y-2">
              {dailyLog.herbsTeas.map(herb => (
                <div key={herb.id} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Coffee className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm">{herb.whatWasInIt}</p>
                      <Badge variant="outline" className="text-xs">{herb.time}</Badge>
                      <Badge className="text-xs">{herb.servingSize}</Badge>
                    </div>
                    {herb.ingredients.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {herb.ingredients.map((ing, i) => (
                          <div key={i}>{ing.name} ({ing.supplier})</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteHerbTea(herb.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No herbs/teas logged yet</p>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Foods (conditional) */}
      {canAddFood && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 4: Foods</CardTitle>
                <CardDescription>Track foods eaten today</CardDescription>
              </div>
              <Dialog open={isFoodDialogOpen} onOpenChange={setIsFoodDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Food
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Food Intake</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="foodTime">Time</Label>
                      <Input
                        id="foodTime"
                        type="time"
                        value={foodTime}
                        onChange={(e) => setFoodTime(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="foodName">Food Name</Label>
                      <Input
                        id="foodName"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="e.g., Quinoa Bowl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="foodServingSize">Serving Size (optional)</Label>
                      <Input
                        id="foodServingSize"
                        value={foodServingSize}
                        onChange={(e) => setFoodServingSize(e.target.value)}
                        placeholder="e.g., 1 cup, 200g"
                      />
                    </div>
                    <div>
                      <Label htmlFor="foodNotes">Notes (optional)</Label>
                      <Textarea
                        id="foodNotes"
                        value={foodNotes}
                        onChange={(e) => setFoodNotes(e.target.value)}
                        placeholder="Any additional details..."
                      />
                    </div>
                    <Button onClick={handleAddFood} className="w-full">Add Food</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {dailyLog && dailyLog.foods.length > 0 ? (
              <div className="space-y-2">
                {dailyLog.foods.map(food => (
                  <div key={food.id} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Apple className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm">{food.foodName}</p>
                        <Badge variant="outline" className="text-xs">{food.time}</Badge>
                        {food.servingSize && <Badge className="text-xs">{food.servingSize}</Badge>}
                      </div>
                      {food.notes && <p className="text-xs text-gray-600">{food.notes}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteFood(food.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No foods logged yet</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
