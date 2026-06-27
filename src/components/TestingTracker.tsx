import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { getTestingReminders, saveTestingReminder, deleteTestingReminder, updateTestCompleted, type TestingReminder } from "../lib/storage";
import { Plus, Trash2, Check, AlertCircle, Calendar } from "lucide-react";

export function TestingTracker() {
  const [reminders, setReminders] = useState<TestingReminder[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<TestingReminder | null>(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const reminders = await getTestingReminders();
    setReminders(reminders);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const frequencyDays = parseInt(formData.get('frequency') as string);
    const startDate = formData.get('startDate') as string || new Date().toISOString().split('T')[0];

    const nextDate = new Date(startDate + 'T00:00:00');
    nextDate.setDate(nextDate.getDate() + frequencyDays);

    const reminder: TestingReminder = {
      id: Date.now().toString(),
      testType: formData.get('testType') as string,
      frequency: frequencyDays,
      lastTestDate: undefined,
      nextTestDate: nextDate.toISOString().split('T')[0],
      notes: formData.get('notes') as string || undefined
    };

    await saveTestingReminder(reminder);
    await loadReminders();
    setIsAddDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleMarkComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReminder) return;

    const formData = new FormData(e.currentTarget);
    const completedDate = formData.get('completedDate') as string;

    await updateTestCompleted(selectedReminder.id, completedDate);
    await loadReminders();
    setIsCompleteDialogOpen(false);
    setSelectedReminder(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteTestingReminder(id);
      await loadReminders();
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr + 'T00:00:00');
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getStatusBadge = (daysUntil: number) => {
    if (daysUntil < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntil === 0) {
      return <Badge className="bg-orange-500">Due Today</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge className="bg-yellow-500">Due Soon</Badge>;
    } else {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
  };

  const upcomingReminders = reminders.filter(r => getDaysUntil(r.nextTestDate) <= 14);
  const otherReminders = reminders.filter(r => getDaysUntil(r.nextTestDate) > 14);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-800">Testing Tracker</h2>
          <p className="text-gray-600">Manage your health testing schedule</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Test Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Testing Reminder</DialogTitle>
              <DialogDescription>Set up a recurring reminder for health tests</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="testType">Test Type</Label>
                <Input 
                  id="testType" 
                  name="testType" 
                  placeholder="e.g., Blood Work, Vitamin Levels" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="frequency">Frequency (days)</Label>
                <Input 
                  id="frequency" 
                  name="frequency" 
                  type="number" 
                  placeholder="90 for 3 months"
                  defaultValue="90"
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">90 days = 3 months, 180 days = 6 months</p>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Any additional information about this test..." 
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">Add Reminder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingReminders.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You have {upcomingReminders.length} test{upcomingReminders.length !== 1 ? 's' : ''} due in the next 2 weeks
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-gray-700">Upcoming Tests</h3>
        {upcomingReminders.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">No upcoming tests in the next 2 weeks</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingReminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.nextTestDate);
              return (
                <Card key={reminder.id} className={daysUntil < 0 ? 'border-red-300' : daysUntil <= 7 ? 'border-yellow-300' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{reminder.testType}</CardTitle>
                        <CardDescription>
                          Every {reminder.frequency} days
                        </CardDescription>
                      </div>
                      {getStatusBadge(daysUntil)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          Next test: {new Date(reminder.nextTestDate + 'T00:00:00').toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {daysUntil < 0 ? (
                          <span className="text-red-600">{Math.abs(daysUntil)} days overdue</span>
                        ) : daysUntil === 0 ? (
                          <span className="text-orange-600">Due today</span>
                        ) : (
                          <span>In {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      {reminder.lastTestDate && (
                        <div className="text-xs text-gray-500">
                          Last completed: {new Date(reminder.lastTestDate + 'T00:00:00').toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {reminder.notes && (
                      <p className="text-sm text-gray-700 pt-2 border-t">{reminder.notes}</p>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedReminder(reminder);
                          setIsCompleteDialogOpen(true);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {otherReminders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-gray-700">All Scheduled Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherReminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.nextTestDate);
              return (
                <Card key={reminder.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{reminder.testType}</CardTitle>
                        <CardDescription>
                          Every {reminder.frequency} days
                        </CardDescription>
                      </div>
                      {getStatusBadge(daysUntil)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          Next test: {new Date(reminder.nextTestDate + 'T00:00:00').toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </div>
                      {reminder.lastTestDate && (
                        <div className="text-xs text-gray-500">
                          Last completed: {new Date(reminder.lastTestDate + 'T00:00:00').toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {reminder.notes && (
                      <p className="text-sm text-gray-700 pt-2 border-t">{reminder.notes}</p>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReminder(reminder);
                          setIsCompleteDialogOpen(true);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Test Complete</DialogTitle>
            <DialogDescription>Record when you completed {selectedReminder?.testType}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMarkComplete} className="space-y-4">
            <div>
              <Label htmlFor="completedDate">Completed Date</Label>
              <Input 
                id="completedDate" 
                name="completedDate" 
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              Next test will be scheduled for {selectedReminder && new Date(
                new Date().getTime() + selectedReminder.frequency * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </div>

            <Button type="submit" className="w-full">Mark Complete</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
