import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Download, Upload, Trash2, Database, CheckCircle, AlertCircle } from "lucide-react";
import * as idb from "../lib/indexedDB";

export function Settings() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const storageStats = await idb.getStorageStats();
      setStats(storageStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await idb.exportAllData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `healing-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage(null);

      const text = await file.text();
      const data = JSON.parse(text);

      await idb.importAllData(data);
      await loadStats();

      setMessage({ type: 'success', text: 'Data imported successfully!' });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL data? This action cannot be undone.\n\n' +
      'It is recommended to export your data first as a backup.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your final warning. ALL your healing journey data will be permanently deleted.\n\n' +
      'Click OK to proceed with deletion.'
    );

    if (!doubleConfirm) return;

    try {
      setLoading(true);
      setMessage(null);

      await idb.clearAllData();
      await loadStats();

      setMessage({ type: 'success', text: 'All data has been cleared.' });
    } catch (error) {
      console.error('Clear failed:', error);
      setMessage({ type: 'error', text: 'Failed to clear data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800">Settings & Backup</h2>
        <p className="text-gray-600">Manage your data and backups</p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Storage Statistics
            </CardTitle>
            <CardDescription>Current data stored in your browser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Items:</span>
              <span className="font-semibold">{getTotalItems()}</span>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Herbs & Foods:</span>
                <span>{stats[idb.STORES.HERBS_FOODS] || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Journal Entries:</span>
                <span>{stats[idb.STORES.JOURNAL_ENTRIES] || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Daily Routines:</span>
                <span>{stats[idb.STORES.DAILY_ROUTINES] || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Outbreak Entries:</span>
                <span>{stats[idb.STORES.OUTBREAKS] || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Testing Reminders:</span>
                <span>{stats[idb.STORES.TESTING_REMINDERS] || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Herb Inventory:</span>
                <span>{stats[idb.STORES.HERB_INVENTORY] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>Export or import your healing journey data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExport}
              disabled={loading || getTotalItems() === 0}
              className="w-full"
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-file-input"
                disabled={loading}
              />
              <Button
                onClick={() => document.getElementById('import-file-input')?.click()}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Tip: Export your data regularly to keep a backup of your healing journey.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions - proceed with caution</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleClearAll}
            disabled={loading || getTotalItems() === 0}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            This will permanently delete all your data. Make sure to export a backup first!
          </p>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Data Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            Your data is stored locally in your browser using IndexedDB, which provides better
            performance and larger storage capacity than traditional methods.
          </p>
          <p>
            <strong>Important:</strong> Your data only exists on this device and browser. To access
            your data on other devices or browsers, use the Export/Import feature.
          </p>
          <p>
            <strong>Backup Recommendation:</strong> Export your data regularly to prevent data loss
            if you clear your browser cache or uninstall your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
