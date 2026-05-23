import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { getSuppliers, saveSupplier, deleteSupplier, getHerbs, renameSupplierGlobally, type Supplier, type Herb } from "../lib/storage";
import { Plus, Trash2, Edit, Store, Phone, Mail, Globe, MapPin, BarChart3, RefreshCw } from "lucide-react";
import { Switch } from "./ui/switch";
import { useAuth } from "../stores/authStore";
import { syncDeleteSupplier } from "../lib/sync";

/**
 * SUPPLIERS COMPONENT
 *
 * Manages supplier information with:
 * - Full CRUD operations
 * - Contact information storage
 * - Purchase metrics and analytics
 * - Active/Inactive status toggle
 */

export function Suppliers() {
  // Auth state
  const { user } = useAuth();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Rename Dialog State
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamingSupplier, setRenamingSupplier] = useState<string>("");
  const [newSupplierName, setNewSupplierName] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    loadSuppliers();
    loadHerbs();
  }, []);

  const loadSuppliers = async () => {
    const data = await getSuppliers();
    const sorted = data.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    setSuppliers(sorted);
  };

  const loadHerbs = async () => {
    const data = await getHerbs();
    setHerbs(data);
  };

  // ============================================
  // FORM FUNCTIONS
  // ============================================

  const resetForm = () => {
    setName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setAddress("");
    setNotes("");
    setIsActive(true);
    setEditingSupplier(null);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setContactPerson(supplier.contactPerson || "");
    setEmail(supplier.email || "");
    setPhone(supplier.phone || "");
    setWebsite(supplier.website || "");
    setAddress(supplier.address || "");
    setNotes(supplier.notes || "");
    setIsActive(supplier.isActive);
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a supplier name");
      return;
    }

    const supplier: Supplier = {
      id: editingSupplier?.id || Date.now().toString(),
      name: name.trim(),
      contactPerson: contactPerson.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      dateAdded: editingSupplier?.dateAdded || new Date().toISOString(),
      isActive
    };

    await saveSupplier(supplier);
    await loadSuppliers();
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier(id);
      if (user) {
        await syncDeleteSupplier(user.id, id);
      }
      await loadSuppliers();
    }
  };

  const openRenameDialog = (supplierName: string) => {
    setRenamingSupplier(supplierName);
    setNewSupplierName(supplierName);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!newSupplierName.trim()) {
      alert("Please enter a new supplier name");
      return;
    }

    if (newSupplierName.trim() === renamingSupplier) {
      alert("New name is the same as the old name");
      return;
    }

    if (confirm(`This will rename "${renamingSupplier}" to "${newSupplierName.trim()}" across all herbs and purchases. Continue?`)) {
      await renameSupplierGlobally(renamingSupplier, newSupplierName.trim());
      await loadSuppliers();
      await loadHerbs();
      setIsRenameDialogOpen(false);
      setRenamingSupplier("");
      setNewSupplierName("");
    }
  };

  // ============================================
  // METRICS FUNCTIONS
  // ============================================

  /**
   * Get metrics for a specific supplier
   * Returns: total herbs using this supplier, total purchases, total spent
   */
  const getSupplierMetrics = (supplierName: string) => {
    let totalHerbs = 0;
    let totalPurchases = 0;
    let totalSpent = 0;

    herbs.forEach(herb => {
      // Check if herb's default supplier matches
      if (herb.supplier === supplierName) {
        totalHerbs++;
      }

      // Check purchases from this supplier
      herb.purchases?.forEach(purchase => {
        if (purchase.source === supplierName) {
          totalPurchases++;
          totalSpent += purchase.cost || 0;
        }
      });
    });

    return { totalHerbs, totalPurchases, totalSpent };
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-gray-600">Track your herb suppliers and purchase metrics</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => {
          const metrics = getSupplierMetrics(supplier.name);
          return (
            <Card key={supplier.id} className={!supplier.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  </div>
                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                {supplier.contactPerson && (
                  <div className="text-sm">
                    <span className="font-medium">Contact:</span> {supplier.contactPerson}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${supplier.email}`} className="hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${supplier.phone}`} className="hover:underline">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-3 w-3" />
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {supplier.website}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{supplier.address}</span>
                  </div>
                )}

                {/* Metrics */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-3 w-3 text-purple-600" />
                    <span className="font-medium">Metrics</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-bold text-blue-600">{metrics.totalHerbs}</div>
                      <div className="text-gray-600">Herbs</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-bold text-green-600">{metrics.totalPurchases}</div>
                      <div className="text-gray-600">Purchases</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="font-bold text-purple-600">${metrics.totalSpent.toFixed(2)}</div>
                      <div className="text-gray-600">Spent</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {supplier.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600 italic">{supplier.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(supplier)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => openRenameDialog(supplier.name)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Rename Globally
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {suppliers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No suppliers yet. Click "Add Supplier" to get started.
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              Manage supplier contact information and track purchase metrics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Supplier Name & Active Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bolingo Balance"
                  required
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active Supplier
                </Label>
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@supplier.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.supplier.com"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this supplier..."
                rows={3}
              />
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingSupplier ? 'Update' : 'Save'} Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Supplier Globally</DialogTitle>
            <DialogDescription>
              This will rename "{renamingSupplier}" across ALL herbs and purchase histories.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="oldName">Current Name</Label>
              <Input
                id="oldName"
                value={renamingSupplier}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="newName">New Name *</Label>
              <Input
                id="newName"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Enter new supplier name"
                autoFocus
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will update the supplier name in:
              </p>
              <ul className="text-sm text-yellow-800 list-disc list-inside mt-2">
                <li>All herbs using this supplier</li>
                <li>All purchase records from this supplier</li>
                <li>Autocomplete suggestions</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsRenameDialogOpen(false);
              setRenamingSupplier("");
              setNewSupplierName("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleRename} variant="default">
              Rename Globally
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
