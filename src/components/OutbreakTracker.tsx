import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  getOutbreakEntries,
  saveOutbreakEntry,
  deleteOutbreakEntry,
  getAllDailyRoutineLogs,
  type OutbreakEntry,
  type DailyRoutineLogNew
} from "../lib/storage";
import { AlertCircle, Plus, Trash2, Clock, Calendar, Activity, Edit } from "lucide-react";

export function OutbreakTracker() {
  const [outbreaks, setOutbreaks] = useState<OutbreakEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOutbreak, setEditingOutbreak] = useState<OutbreakEntry | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyRoutineLogNew[]>([]);

  // Form state
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isOngoing, setIsOngoing] = useState(true);
  const [notes, setNotes] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [triggers, setTriggers] = useState("");
  const [lookbackHours, setLookbackHours] = useState(48);

  useEffect(() => {
    loadOutbreaks();
    loadDailyLogs();
  }, []);

  const loadOutbreaks = async () => {
    const data = await getOutbreakEntries();
    // Sort by start date, most recent first
    const sorted = data.sort((a, b) => {
      const dateCompare = b.startDate.localeCompare(a.startDate);
      if (dateCompare !== 0) return dateCompare;
      return (b.startTime || '').localeCompare(a.startTime || '');
    });
    setOutbreaks(sorted);
  };

  const loadDailyLogs = async () => {
    const logs = await getAllDailyRoutineLogs();
    setDailyLogs(logs);
  };

  const resetForm = () => {
    setStartDate(new Date().toISOString().split('T')[0]);
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setSeverity(3);
    setIsOngoing(true);
    setNotes("");
    setSymptoms("");
    setTriggers("");
    setLookbackHours(48);
    setEditingOutbreak(null);
  };

  const openEditDialog = (outbreak: OutbreakEntry) => {
    setEditingOutbreak(outbreak);
    setStartDate(outbreak.startDate);
    setStartTime(outbreak.startTime || "");
    setEndDate(outbreak.endDate || "");
    setEndTime(outbreak.endTime || "");
    setSeverity(outbreak.severity);
    setIsOngoing(outbreak.isOngoing);
    setNotes(outbreak.notes);
    setSymptoms(outbreak.symptoms || "");
    setTriggers(outbreak.triggers || "");
    setIsDialogOpen(true);
  };

  const getFoodsBeforeOutbreak = (outbreakStartDate: string, outbreakStartTime: string, lookbackHrs: number) => {
    const foods: Array<{
      foodName: string;
      consumedDate: string;
      consumedTime: string;
      hoursBeforeOutbreak: number;
    }> = [];

    // Parse outbreak datetime
    const outbreakDateTime = new Date(`${outbreakStartDate}T${outbreakStartTime || '00:00'}:00`);
    const lookbackMs = lookbackHrs * 60 * 60 * 1000;

    // Find all foods consumed within lookback period
    dailyLogs.forEach(log => {
      log.foods.forEach(food => {
        const consumedDateTime = new Date(`${log.date}T${food.time}:00`);
        const timeDiffMs = outbreakDateTime.getTime() - consumedDateTime.getTime();

        // Only include foods consumed BEFORE the outbreak within lookback window
        if (timeDiffMs > 0 && timeDiffMs <= lookbackMs) {
          const hoursBeforeOutbreak = Math.round(timeDiffMs / (1000 * 60 * 60) * 10) / 10;
          foods.push({
            foodName: food.foodName,
            consumedDate: log.date,
            consumedTime: food.time,
            hoursBeforeOutbreak
          });
        }
      });
    });

    // Sort by most recent first (smallest hours before)
    return foods.sort((a, b) => a.hoursBeforeOutbreak - b.hoursBeforeOutbreak);
  };

  const handleSave = async () => {
    if (!startDate) {
      alert("Please select a start date");
      return;
    }

    const foodsBeforeOutbreak = getFoodsBeforeOutbreak(startDate, startTime, lookbackHours);

    const outbreakEntry: OutbreakEntry = {
      id: editingOutbreak?.id || Date.now().toString(),
      startDate,
      startTime: startTime || undefined,
      endDate: isOngoing ? undefined : (endDate || undefined),
      endTime: isOngoing ? undefined : (endTime || undefined),
      severity,
      foodsBeforeOutbreak,
      notes,
      symptoms: symptoms || undefined,
      triggers: triggers || undefined,
      isOngoing
    };

    await saveOutbreakEntry(outbreakEntry);
    await loadOutbreaks();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this outbreak entry?")) {
      await deleteOutbreakEntry(id);
      await loadOutbreaks();
    }
  };

  const getSeverityLabel = (sev: number) => {
    const labels = ['Mild', 'Moderate', 'Severe', 'Very Severe', 'Extreme'];
    return labels[sev - 1] || 'Moderate';
  };

  const getSeverityColor = (sev: number) => {
    const colors = ['bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-700', 'bg-red-900'];
    return colors[sev - 1] || 'bg-orange-500';
  };

  const calculateDuration = (outbreak: OutbreakEntry) => {
    if (outbreak.isOngoing) return "Ongoing";

    if (!outbreak.endDate) return "Ongoing";

    const start = new Date(`${outbreak.startDate}T${outbreak.startTime || '00:00'}:00`);
    const end = new Date(`${outbreak.endDate}T${outbreak.endTime || '23:59'}:59`);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours}h`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  const formatDateTime = (date: string, time?: string) => {
    const d = new Date(date);
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return time ? `${formatted} at ${time}` : formatted;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Outbreak Tracker</h2>
          <p className="text-gray-600">Track and analyze outbreak occurrences</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Outbreak
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOutbreak ? 'Edit Outbreak' : 'Add New Outbreak'}</DialogTitle>
              <DialogDescription>
                Record outbreak details and automatically track foods consumed before it occurred
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time (optional)</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select value={severity.toString()} onValueChange={(val) => setSeverity(parseInt(val) as 1 | 2 | 3 | 4 | 5)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Mild</SelectItem>
                    <SelectItem value="2">2 - Moderate</SelectItem>
                    <SelectItem value="3">3 - Severe</SelectItem>
                    <SelectItem value="4">4 - Very Severe</SelectItem>
                    <SelectItem value="5">5 - Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ongoing Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOngoing"
                  checked={isOngoing}
                  onChange={(e) => setIsOngoing(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isOngoing">This outbreak is still ongoing</Label>
              </div>

              {/* End Date & Time (only if not ongoing) */}
              {!isOngoing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      min={startDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time (optional)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Lookback Period */}
              <div className="space-y-2">
                <Label htmlFor="lookbackHours">Food Lookback Period (hours before outbreak)</Label>
                <Input
                  id="lookbackHours"
                  type="number"
                  min="1"
                  max="168"
                  value={lookbackHours}
                  onChange={(e) => setLookbackHours(parseInt(e.target.value) || 48)}
                />
                <p className="text-sm text-gray-500">
                  Will track foods consumed within {lookbackHours} hours before the outbreak
                </p>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe the symptoms experienced..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Triggers */}
              <div className="space-y-2">
                <Label htmlFor="triggers">Potential Triggers</Label>
                <Textarea
                  id="triggers"
                  placeholder="Any suspected triggers (stress, lack of sleep, etc.)..."
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other observations or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Preview foods that will be tracked */}
              {startDate && startTime && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Foods to be tracked:</strong> {getFoodsBeforeOutbreak(startDate, startTime, lookbackHours).length} food(s)
                    consumed within {lookbackHours} hours before outbreak
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingOutbreak ? 'Update' : 'Save'} Outbreak
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outbreaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outbreaks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outbreaks.filter(o => o.isOngoing).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outbreaks.length > 0
                ? (outbreaks.reduce((sum, o) => sum + o.severity, 0) / outbreaks.length).toFixed(1)
                : '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outbreaks.filter(o => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return new Date(o.startDate) >= thirtyDaysAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outbreak List */}
      {outbreaks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No outbreaks recorded yet. Click "Add Outbreak" to start tracking.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {outbreaks.map((outbreak) => (
            <Card key={outbreak.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(outbreak.severity).replace('bg-', '#') }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {formatDateTime(outbreak.startDate, outbreak.startTime)}
                      </CardTitle>
                      <Badge className={`${getSeverityColor(outbreak.severity)} text-white`}>
                        {getSeverityLabel(outbreak.severity)}
                      </Badge>
                      {outbreak.isOngoing && (
                        <Badge variant="destructive">Ongoing</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duration: {calculateDuration(outbreak)}
                      </span>
                      {!outbreak.isOngoing && outbreak.endDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ended: {formatDateTime(outbreak.endDate, outbreak.endTime)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(outbreak)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(outbreak.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Symptoms */}
                {outbreak.symptoms && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Symptoms
                    </h4>
                    <p className="text-sm text-gray-700">{outbreak.symptoms}</p>
                  </div>
                )}

                {/* Triggers */}
                {outbreak.triggers && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Potential Triggers</h4>
                    <p className="text-sm text-gray-700">{outbreak.triggers}</p>
                  </div>
                )}

                {/* Foods Before Outbreak */}
                {outbreak.foodsBeforeOutbreak.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Foods Consumed Before Outbreak</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {outbreak.foodsBeforeOutbreak.map((food, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-orange-50 p-2 rounded">
                          <span className="font-medium">{food.foodName}</span>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>{food.consumedDate} at {food.consumedTime}</span>
                            <Badge variant="outline" className="text-xs">
                              {food.hoursBeforeOutbreak}h before
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {outbreak.notes && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Notes</h4>
                    <p className="text-sm text-gray-700">{outbreak.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
