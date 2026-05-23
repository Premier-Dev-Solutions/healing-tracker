import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { getHerbs, saveHerb, deleteHerb, type Herb, type Purchase } from "../lib/storage";
import { Plus, Trash2, Edit, ShoppingCart, Upload, Download, Grid, Table, Search, X } from "lucide-react";
import { importFile, generateCSVTemplate } from "../lib/csvParser";
import { useAuth } from "../stores/authStore";
import { syncAll, syncDeleteHerb } from "../lib/sync";
import { toast } from "sonner";

/**
 * HERBS COMPONENT - Step by Step
 *
 * This manages your herbal inventory
 */

export function Herbs() {
  // Auth state
  const { user } = useAuth();

  // ============================================
  // STEP 1: STATE - Data that can change
  // ============================================

  // This holds our list of herbs from the database
  const [herbs, setHerbs] = useState<Herb[]>([]);

  // UI State - controls what's visible
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHerb, setEditingHerb] = useState<Herb | null>(null);
  const [dialogTab, setDialogTab] = useState<"details" | "purchases">("details");

  // Form Fields - matching your CSV structure
  const [name, setName] = useState("");
  const [supplementType, setSupplementType] = useState<Herb['supplementType']>("herb");
  const [supplier, setSupplier] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [serving, setServing] = useState("");
  const [dailyAmount, setDailyAmount] = useState("");
  const [benefits, setBenefits] = useState("");
  const [category, setCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [description, setDescription] = useState("");
  const [preparationInstructions, setPreparationInstructions] = useState("");
  const [stockLevel, setStockLevel] = useState<Herb['stockLevel']>("high");

  // Purchase Management
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseSource, setPurchaseSource] = useState("");

  // Supplier Management - for autocomplete
  const [allSuppliers, setAllSuppliers] = useState<string[]>([]);

  // View Mode - Card or Table
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-newest");

  // Bulk Edit State - for table view
  const [editingCells, setEditingCells] = useState<Record<string, any>>({});
  const [bulkEditHerbs, setBulkEditHerbs] = useState<Herb[]>([]);

  // Modal for editing long text fields
  const [textEditModal, setTextEditModal] = useState<{open: boolean, herbId: string, field: string, value: string}>({
    open: false,
    herbId: '',
    field: '',
    value: ''
  });

  // ============================================
  // STEP 2: LOAD DATA when component first appears
  // ============================================

  useEffect(() => {
    // This runs ONCE when the component loads
    loadHerbs();
  }, []); // Empty array = run once on mount

  const loadHerbs = async () => {
    // Get herbs from IndexedDB
    const data = await getHerbs();

    // Sort by newest first
    const sorted = data.sort((a, b) =>
      b.dateAdded.localeCompare(a.dateAdded)
    );

    // Update state (this triggers a re-render)
    setHerbs(sorted);
    setBulkEditHerbs(sorted); // Initialize bulk edit copy

    // Extract all unique suppliers for autocomplete
    updateSuppliersList(sorted);
  };

  /**
   * UPDATE SUPPLIERS LIST - Extract unique suppliers from all herbs
   * This builds the autocomplete list by collecting:
   * 1. Supplier from each herb's main details
   * 2. Source/Store from each purchase in purchase history
   */
  const updateSuppliersList = (herbsList: Herb[]) => {
    const suppliersSet = new Set<string>();

    herbsList.forEach(herb => {
      // Add herb's default supplier
      if (herb.supplier && herb.supplier.trim()) {
        suppliersSet.add(herb.supplier.trim());
      }

      // Add all purchase sources
      herb.purchases?.forEach(purchase => {
        if (purchase.source && purchase.source.trim()) {
          suppliersSet.add(purchase.source.trim());
        }
      });
    });

    // Convert Set to sorted array
    const uniqueSuppliers = Array.from(suppliersSet).sort();
    setAllSuppliers(uniqueSuppliers);
  };

  /**
   * GET PURCHASE STATS - Calculate statistics for current herb's purchases
   * Returns: total purchases, unique suppliers, total cost, most used supplier
   */
  const getPurchaseStats = () => {
    if (!purchases || purchases.length === 0) {
      return null;
    }

    const totalPurchases = purchases.length;
    const uniqueSources = new Set(purchases.map((p: Purchase) => p.source).filter(Boolean));
    const totalCost = purchases.reduce((sum: number, p: Purchase) => sum + (p.cost || 0), 0);

    // Find most used supplier
    const sourceCount: Record<string, number> = {};
    purchases.forEach((p: Purchase) => {
      if (p.source) {
        sourceCount[p.source] = (sourceCount[p.source] || 0) + 1;
      }
    });
    const mostUsedSupplier = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalPurchases,
      uniqueSources: uniqueSources.size,
      totalCost,
      mostUsedSupplier: mostUsedSupplier ? { name: mostUsedSupplier[0], count: mostUsedSupplier[1] } : null
    };
  };

  // ============================================
  // STEP 3: FORM FUNCTIONS
  // ============================================

  /**
   * RESET FORM - Clear all fields
   * Called when opening new form or after saving
   */
  const resetForm = () => {
    setName("");
    setSupplementType("herb");
    setSupplier("");
    setIngredients("");
    setServing("");
    setDailyAmount("");
    setBenefits("");
    setCategory("");
    setSecondaryCategory("");
    setDescription("");
    setPreparationInstructions("");
    setStockLevel("high");
    setPurchases([]);
    setEditingHerb(null);
    setShowPurchaseForm(false);
    setDialogTab("details"); // Reset to details tab
  };

  /**
   * OPEN EDIT DIALOG - Load herb data into form
   * This is called when you click the Edit button on a herb card
   */
  const openEditDialog = (herb: Herb) => {
    setEditingHerb(herb);
    setName(herb.name);
    setSupplementType(herb.supplementType);
    setSupplier(herb.supplier || "");
    setIngredients(herb.ingredients || "");
    setServing(herb.serving || "");
    setDailyAmount(herb.dailyAmount || "");
    setBenefits(herb.benefits);
    setCategory(herb.category);
    setSecondaryCategory(herb.secondaryCategory || "");
    setDescription(herb.description || "");
    setPreparationInstructions(herb.preparationInstructions || "");
    setStockLevel(herb.stockLevel || "high");
    setPurchases(herb.purchases || []);
    setIsAddDialogOpen(true);
  };

  /**
   * SAVE HERB - Create or update herb in database
   */
  const handleSave = async () => {
    // Validation - make sure name is filled
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    // Build the Herb object
    const herb: Herb = {
      id: editingHerb?.id || Date.now().toString(), // Use existing ID or create new
      name: name.trim(),
      supplementType,
      supplier: supplier.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      serving: serving.trim() || undefined,
      dailyAmount: dailyAmount.trim() || undefined,
      benefits: benefits.trim(),
      category: category.trim(),
      secondaryCategory: secondaryCategory.trim() || undefined,
      description: description.trim() || undefined,
      preparationInstructions: preparationInstructions.trim() || undefined,
      stockLevel: stockLevel,
      dateAdded: editingHerb?.dateAdded || new Date().toISOString(),
      purchases: purchases
    };

    // Save to IndexedDB
    await saveHerb(herb);

    // Reload the list
    await loadHerbs();

    // Close dialog and reset
    setIsAddDialogOpen(false);
    resetForm();
  };

  /**
   * DELETE HERB
   */
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this herb?")) {
      await deleteHerb(id);
      if (user) {
        await syncDeleteHerb(user.id, id);
      }
      await loadHerbs();
    }
  };

  /**
   * DOWNLOAD CSV TEMPLATE
   * Creates a CSV file with headers and sample data
   */
  const downloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'herb_inventory_template.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * IMPORT CSV/XLSX - Smart Import (Updates existing, adds new)
   */
  const handleImport = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFile(file);

      // Get current herbs to check for duplicates
      const currentHerbs = await getHerbs();

      let addedCount = 0;
      let updatedCount = 0;
      let failedCount = 0;

      for (const item of importedData) {
        try {
          // Check if herb already exists by name (case-insensitive)
          const existingHerb = currentHerbs.find(
            h => h.name.toLowerCase() === item.name.toLowerCase()
          );

          if (existingHerb) {
            // UPDATE existing herb - preserve ID, dateAdded, and purchases
            const updatedHerb: Herb = {
              id: existingHerb.id,
              name: item.name,
              supplementType: (item.supplementType as Herb['supplementType']) || existingHerb.supplementType,
              category: item.category || existingHerb.category,
              secondaryCategory: item.secondaryCategory || existingHerb.secondaryCategory,
              benefits: item.benefits || existingHerb.benefits,
              description: item.description || existingHerb.description,
              ingredients: item.ingredients || existingHerb.ingredients,
              supplier: item.supplier || existingHerb.supplier,
              preparationInstructions: item.preparationInstructions || existingHerb.preparationInstructions,
              serving: item.servingSize || existingHerb.serving,
              dailyAmount: item.dailyServingRequirement?.toString() || existingHerb.dailyAmount,
              dateAdded: existingHerb.dateAdded, // Keep original date
              purchases: existingHerb.purchases // Preserve purchase history
            };

            await saveHerb(updatedHerb);
            updatedCount++;
          } else {
            // ADD new herb with proper UUID
            const newHerb: Herb = {
              id: crypto.randomUUID(),
              name: item.name,
              supplementType: (item.supplementType as Herb['supplementType']) || 'herb',
              category: item.category || '',
              secondaryCategory: item.secondaryCategory,
              benefits: item.benefits || '',
              description: item.description,
              ingredients: item.ingredients,
              supplier: item.supplier,
              preparationInstructions: item.preparationInstructions,
              serving: item.servingSize,
              dailyAmount: item.dailyServingRequirement?.toString(),
              dateAdded: new Date().toISOString(),
              purchases: []
            };

            await saveHerb(newHerb);
            addedCount++;
          }
        } catch (err) {
          console.error('Error saving herb:', err);
          failedCount++;
        }
      }

      await loadHerbs();

      // Show import success toast
      toast.success(`Import complete — Added: ${addedCount} | Updated: ${updatedCount} | Failed: ${failedCount}`);

      // Trigger sync if user is authenticated
      if (user) {
        try {
          await syncAll(user.id);
          toast.success('Synced to cloud');
        } catch (syncErr) {
          console.error('Sync error:', syncErr);
          toast.error('Sync failed — please try again');
        }
      }

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed — please check your file format');
    }
  };

  /**
   * ADD PURCHASE - Add purchase to the list
   */
  const addPurchase = () => {
    if (!purchaseDate || !purchaseQuantity) {
      toast.error("Please enter date and quantity");
      return;
    }

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      date: purchaseDate,
      quantity: purchaseQuantity,
      cost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      source: purchaseSource || undefined
    };

    // Add to purchases array
    setPurchases([...purchases, newPurchase]);

    // Reset purchase form
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseQuantity("");
    setPurchaseCost("");
    setPurchaseSource("");
    setShowPurchaseForm(false);
  };

  /**
   * DELETE PURCHASE - Remove from list
   */
  const deletePurchase = (purchaseId: string) => {
    setPurchases(purchases.filter((p: Purchase) => p.id !== purchaseId));
  };

  /**
   * BULK EDIT FUNCTIONS - For table view
   */
  const updateBulkEditCell = (herbId: string, field: keyof Herb, value: any) => {
    setBulkEditHerbs((prev: Herb[]) =>
      prev.map((herb: Herb) =>
        herb.id === herbId ? { ...herb, [field]: value } : herb
      )
    );
  };

  const saveBulkEdits = async () => {
    try {
      // Save all modified herbs
      for (const herb of bulkEditHerbs) {
        await saveHerb(herb);
      }
      await loadHerbs();
      toast.success('All changes saved successfully!');
    } catch (error) {
      console.error('Bulk save error:', error);
      toast.error('Failed to save changes');
    }
  };

  const cancelBulkEdits = () => {
    setBulkEditHerbs(herbs); // Reset to original data
    setEditingCells({});
  };

  /**
   * OPEN TEXT EDITOR MODAL - For long text fields
   */
  const openTextEditor = (herbId: string, field: string, value: string) => {
    setTextEditModal({
      open: true,
      herbId,
      field,
      value: value || ''
    });
  };

  /**
   * SAVE TEXT FROM MODAL
   */
  const saveTextFromModal = () => {
    updateBulkEditCell(textEditModal.herbId, textEditModal.field as keyof Herb, textEditModal.value);
    setTextEditModal({ open: false, herbId: '', field: '', value: '' });
  };

  /**
   * GET STOCK BADGE - Returns badge color and text for stock level
   */
  const getStockBadge = (level?: Herb['stockLevel']) => {
    switch (level) {
      case 'high':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢', label: 'High Stock' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡', label: 'Medium Stock' };
      case 'low':
        return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🟠', label: 'Low Stock' };
      case 'out':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴', label: 'Out of Stock' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '⚪', label: 'Unknown' };
    }
  };

  /**
   * FILTER AND SORT HERBS
   * Applies search, filters, and sorting to the herbs list
   */
  const getFilteredAndSortedHerbs = () => {
    let filtered = [...herbs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(herb =>
        herb.name.toLowerCase().includes(query) ||
        herb.benefits?.toLowerCase().includes(query) ||
        herb.category?.toLowerCase().includes(query) ||
        herb.ingredients?.toLowerCase().includes(query) ||
        herb.description?.toLowerCase().includes(query)
      );
    }

    // Apply supplement type filter
    if (filterType !== "all") {
      filtered = filtered.filter(herb => herb.supplementType === filterType);
    }

    // Apply supplier filter
    if (filterSupplier !== "all") {
      filtered = filtered.filter(herb => herb.supplier === filterSupplier);
    }

    // Apply stock level filter
    if (filterStock !== "all") {
      filtered = filtered.filter(herb => herb.stockLevel === filterStock);
    }

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "date-newest":
        filtered.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
        break;
      case "date-oldest":
        filtered.sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));
        break;
      case "purchases-most":
        filtered.sort((a, b) => (b.purchases?.length || 0) - (a.purchases?.length || 0));
        break;
      case "cost-highest":
        filtered.sort((a, b) => {
          const costA = a.purchases?.reduce((sum, p) => sum + (p.cost || 0), 0) || 0;
          const costB = b.purchases?.reduce((sum, p) => sum + (p.cost || 0), 0) || 0;
          return costB - costA;
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  /**
   * GET COMPREHENSIVE METRICS
   * Calculate detailed statistics for the dashboard
   */
  const getMetrics = () => {
    const totalHerbs = herbs.length;

    // Count by type
    const typeCounts: Record<string, number> = {};
    herbs.forEach(herb => {
      typeCounts[herb.supplementType] = (typeCounts[herb.supplementType] || 0) + 1;
    });
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    // Calculate total investment
    const totalInvested = herbs.reduce((sum, herb) => {
      const herbCost = herb.purchases?.reduce((s, p) => s + (p.cost || 0), 0) || 0;
      return sum + herbCost;
    }, 0);

    // Count unique suppliers
    const uniqueSuppliers = new Set(herbs.map(h => h.supplier).filter(Boolean));

    // Count herbs with purchases
    const herbsWithPurchases = herbs.filter(h => h.purchases && h.purchases.length > 0).length;

    // Count unique categories
    const uniqueCategories = new Set(herbs.map(h => h.category).filter(Boolean));

    // Recent purchases (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPurchases = herbs.filter(herb =>
      herb.purchases?.some(p => new Date(p.date) >= thirtyDaysAgo)
    ).length;

    // Total purchase count
    const totalPurchases = herbs.reduce((sum, herb) => sum + (herb.purchases?.length || 0), 0);

    return {
      totalHerbs,
      mostCommonType: mostCommonType ? { type: mostCommonType[0], count: mostCommonType[1] } : null,
      totalInvested,
      uniqueSuppliers: uniqueSuppliers.size,
      herbsWithPurchases,
      uniqueCategories: uniqueCategories.size,
      recentPurchases,
      totalPurchases
    };
  };

  const filteredHerbs = getFilteredAndSortedHerbs();
  const metrics = getMetrics();

  // Update bulk edit herbs when filters change
  useEffect(() => {
    setBulkEditHerbs(filteredHerbs);
  }, [searchQuery, filterType, filterSupplier, filterStock, sortBy, herbs]);

  // ============================================
  // STEP 3: RENDER - What shows on screen
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Herbal Inventory</h2>
          <p className="text-gray-600">Manage your herbal supplements</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={downloadTemplate} className="flex-1 md:flex-initial" title="Download CSV Template">
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Download Template</span>
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('herb-import')?.click()} className="flex-1 md:flex-initial" title="Import CSV/XLSX">
            <Upload className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Import CSV/XLSX</span>
          </Button>
          <input
            id="herb-import"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }} className="flex-1 md:flex-initial">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Add Herb</span>
          </Button>
        </div>
      </div>

      {/* Slim Stats Bar */}
      <div className="py-3 border-y border-gray-200">
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Total:</span>
            <span className="text-lg font-bold text-gray-900">{metrics.totalHerbs}</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Herbs:</span>
            <span className="text-lg font-bold text-gray-900">{herbs.filter(h => h.supplementType === 'herb').length}</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Suppliers:</span>
            <span className="text-lg font-bold text-gray-900">{metrics.uniqueSuppliers}</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Categories:</span>
            <span className="text-lg font-bold text-gray-900">{metrics.uniqueCategories}</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Invested:</span>
            <span className="text-lg font-bold text-gray-900">${metrics.totalInvested.toFixed(0)}</span>
          </div>
          {(searchQuery || filterType !== "all" || filterSupplier !== "all" || filterStock !== "all") && (
            <>
              <div className="hidden md:block h-6 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                <span className="text-sm text-gray-500">Showing:</span>
                <span className="text-lg font-bold text-green-600">{filteredHerbs.length} of {metrics.totalHerbs}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <Input
                placeholder="Search herbs by name, benefits, category, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="herb">Herb</SelectItem>
                    <SelectItem value="tonic">Tonic</SelectItem>
                    <SelectItem value="herb bundle">Herb Bundle</SelectItem>
                    <SelectItem value="herb blend">Herb Blend</SelectItem>
                    <SelectItem value="tea bag">Tea Bag</SelectItem>
                    <SelectItem value="pills">Pills</SelectItem>
                    <SelectItem value="gel">Gel</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {allSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterStock} onValueChange={setFilterStock}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="high">🟢 High Stock</SelectItem>
                    <SelectItem value="medium">🟡 Medium Stock</SelectItem>
                    <SelectItem value="low">🟠 Low Stock</SelectItem>
                    <SelectItem value="out">🔴 Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
                    <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="purchases-most">Most Purchased</SelectItem>
                    <SelectItem value="cost-highest">Highest Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || filterType !== "all" || filterSupplier !== "all" || filterStock !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterSupplier("all");
                  setFilterStock("all");
                }}
                className="w-full md:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}

            {/* Results Counter */}
            <div className="text-sm text-gray-600">
              Showing <strong>{filteredHerbs.length}</strong> of <strong>{herbs.length}</strong> herbs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Needs Reorder Alert - Show herbs that are low or out of stock */}
      {(() => {
        const needsReorder = herbs.filter(h => h.stockLevel === 'low' || h.stockLevel === 'out');
        if (needsReorder.length === 0) return null;

        return (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-orange-600">⚠️ Needs Reorder</span>
                <Badge className="bg-orange-600 text-white">{needsReorder.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {needsReorder.map(herb => {
                  const badge = getStockBadge(herb.stockLevel);
                  return (
                    <div key={herb.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <div className="font-medium">{herb.name}</div>
                          <div className="text-sm text-gray-600">
                            {herb.supplementType} {herb.supplier && `• ${herb.supplier}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(herb)}
                      >
                        Update Stock
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* CARD VIEW */}
      {viewMode === "cards" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHerbs.map((herb) => (
              <Card key={herb.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{herb.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2 items-center">
                        <Badge variant="outline">{herb.supplementType}</Badge>
                        {herb.stockLevel && (
                          <Badge className={`border ${getStockBadge(herb.stockLevel).color}`}>
                            {getStockBadge(herb.stockLevel).icon} {getStockBadge(herb.stockLevel).label}
                          </Badge>
                        )}
                        {herb.supplier && <span className="text-xs text-gray-600">{herb.supplier}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(herb)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(herb.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {herb.category && (
                    <div>
                      <strong>Category:</strong> {herb.category}
                      {herb.secondaryCategory && ` / ${herb.secondaryCategory}`}
                    </div>
                  )}
                  {herb.serving && (
                    <div><strong>Serving:</strong> {herb.serving}</div>
                  )}
                  {herb.dailyAmount && (
                    <div><strong>Daily Amount:</strong> {herb.dailyAmount}</div>
                  )}
                  {herb.benefits && (
                    <div className="pt-2 border-t">
                      <strong>Benefits:</strong>
                      <p className="text-gray-600 mt-1 line-clamp-3">{herb.benefits}</p>
                    </div>
                  )}
                  {herb.purchases && herb.purchases.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-1 text-gray-600">
                        <ShoppingCart className="h-3 w-3" />
                        <span>{herb.purchases.length} purchase(s)</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHerbs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                {herbs.length === 0
                  ? "No herbs yet. Click 'Add Herb' to get started."
                  : "No herbs match your search or filters. Try adjusting your criteria."}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* TABLE VIEW - Bulk Edit Spreadsheet */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bulk Edit Spreadsheet</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Scroll horizontally to see all columns →</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelBulkEdits}>
                  Cancel Changes
                </Button>
                <Button onClick={saveBulkEdits}>
                  Save All Changes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[75vh] w-full">
              <table className="w-full border-collapse text-sm table-auto">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-gray-100 border-b">
                    <th className="p-2 text-left font-medium border-r bg-gray-100" style={{width: '15%'}}>Name</th>
                    <th className="p-2 text-left font-medium border-r" style={{width: '8%'}}>Type</th>
                    <th className="p-2 text-left font-medium border-r" style={{width: '12%'}}>Supplier</th>
                    <th className="p-2 text-left font-medium border-r" style={{width: '12%'}}>Category</th>
                    <th className="hidden md:table-cell p-2 text-left font-medium border-r" style={{width: '10%'}}>Sub Category</th>
                    <th className="p-2 text-left font-medium border-r" style={{width: '8%'}}>Serving</th>
                    <th className="p-2 text-left font-medium border-r" style={{width: '8%'}}>Daily Amount</th>
                    <th className="p-2 text-left font-medium border-r" style={{width: '9%'}}>Benefits</th>
                    <th className="hidden md:table-cell p-2 text-left font-medium border-r" style={{width: '9%'}}>Ingredients</th>
                    <th className="hidden md:table-cell p-2 text-left font-medium border-r" style={{width: '9%'}}>Description</th>
                    <th className="hidden md:table-cell p-2 text-left font-medium border-r" style={{width: '9%'}}>Preparation</th>
                    <th className="p-2 text-center font-medium bg-gray-100" style={{width: '3%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkEditHerbs.map((herb, index) => (
                    <tr key={herb.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-2 border-r">
                        <Input
                          value={herb.name}
                          onChange={(e) => updateBulkEditCell(herb.id, 'name', e.target.value)}
                          className="w-full h-9 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2 border-r">
                        <Select
                          value={herb.supplementType}
                          onValueChange={(val) => updateBulkEditCell(herb.id, 'supplementType', val)}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="herb">Herb</SelectItem>
                            <SelectItem value="tonic">Tonic</SelectItem>
                            <SelectItem value="herb bundle">Herb Bundle</SelectItem>
                            <SelectItem value="herb blend">Herb Blend</SelectItem>
                            <SelectItem value="tea bag">Tea Bag</SelectItem>
                            <SelectItem value="pills">Pills</SelectItem>
                            <SelectItem value="gel">Gel</SelectItem>
                            <SelectItem value="topical">Topical</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2 border-r">
                        <Input
                          value={herb.supplier || ''}
                          onChange={(e) => updateBulkEditCell(herb.id, 'supplier', e.target.value)}
                          className="w-full h-9 px-2 py-1 text-sm"
                          list="suppliers-list"
                        />
                      </td>
                      <td className="p-2 border-r">
                        <Input
                          value={herb.category}
                          onChange={(e) => updateBulkEditCell(herb.id, 'category', e.target.value)}
                          className="w-full h-9 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="hidden md:table-cell p-2 border-r">
                        <Input
                          value={herb.secondaryCategory || ''}
                          onChange={(e) => updateBulkEditCell(herb.id, 'secondaryCategory', e.target.value)}
                          className="w-full h-9 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2 border-r">
                        <Input
                          value={herb.serving || ''}
                          onChange={(e) => updateBulkEditCell(herb.id, 'serving', e.target.value)}
                          className="w-full h-9 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2 border-r">
                        <Input
                          value={herb.dailyAmount || ''}
                          onChange={(e) => updateBulkEditCell(herb.id, 'dailyAmount', e.target.value)}
                          className="w-full h-9 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2 border-r cursor-pointer hover:bg-gray-100" onClick={() => openTextEditor(herb.id, 'benefits', herb.benefits)}>
                        <div className="text-sm truncate" title={herb.benefits}>
                          {herb.benefits || <span className="text-gray-400">Click to edit...</span>}
                        </div>
                      </td>
                      <td className="hidden md:table-cell p-2 border-r cursor-pointer hover:bg-gray-100" onClick={() => openTextEditor(herb.id, 'ingredients', herb.ingredients || '')}>
                        <div className="text-sm truncate" title={herb.ingredients}>
                          {herb.ingredients || <span className="text-gray-400">Click to edit...</span>}
                        </div>
                      </td>
                      <td className="hidden md:table-cell p-2 border-r cursor-pointer hover:bg-gray-100" onClick={() => openTextEditor(herb.id, 'description', herb.description || '')}>
                        <div className="text-sm truncate" title={herb.description}>
                          {herb.description || <span className="text-gray-400">Click to edit...</span>}
                        </div>
                      </td>
                      <td className="hidden md:table-cell p-2 border-r cursor-pointer hover:bg-gray-100" onClick={() => openTextEditor(herb.id, 'preparationInstructions', herb.preparationInstructions || '')}>
                        <div className="text-sm truncate" title={herb.preparationInstructions}>
                          {herb.preparationInstructions || <span className="text-gray-400">Click to edit...</span>}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(herb.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {bulkEditHerbs.length === 0 && (
              <div className="py-12 text-center text-gray-600">
                {herbs.length === 0
                  ? "No herbs yet. Click 'Add Herb' to get started."
                  : "No herbs match your search or filters. Try adjusting your criteria."}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* ADD/EDIT DIALOG FORM WITH TABS */}
      {/* ============================================ */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHerb ? 'Edit Herb' : 'Add New Herb'}</DialogTitle>
            <DialogDescription>
              Use the tabs below to manage herb details and purchase history.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={dialogTab} onValueChange={(val) => setDialogTab(val as "details" | "purchases")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Herb Details</TabsTrigger>
              <TabsTrigger value="purchases">Purchase History</TabsTrigger>
            </TabsList>

            {/* ============================================ */}
            {/* TAB 1: HERB DETAILS */}
            {/* ============================================ */}
            <TabsContent value="details" className="space-y-4 py-4">
            {/* Product Name - Required */}
            <div>
              <Label htmlFor="name" className="block mb-2">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Una Del Gato"
                required
              />
            </div>

            {/* Supplement Type & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplementType" className="block mb-2">Supplement Type</Label>
                <Select value={supplementType} onValueChange={(val) => setSupplementType(val as Herb['supplementType'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herb">Herb</SelectItem>
                    <SelectItem value="tonic">Tonic</SelectItem>
                    <SelectItem value="herb bundle">Herb Bundle</SelectItem>
                    <SelectItem value="herb blend">Herb Blend</SelectItem>
                    <SelectItem value="tea bag">Tea Bag</SelectItem>
                    <SelectItem value="pills">Pills</SelectItem>
                    <SelectItem value="gel">Gel</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supplier" className="block mb-2">Supplier</Label>
                <Input
                  id="supplier"
                  list="suppliers-list"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Bolingo Balance"
                />
                {/* @ts-expect-error - datalist is valid HTML but not in React types */}
                <datalist id="suppliers-list">
                  {allSuppliers.map((sup: string) => (
                    <option key={sup} value={sup} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Serving & Daily Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serving" className="block mb-2">Serving Size</Label>
                <Input
                  id="serving"
                  value={serving}
                  onChange={(e) => setServing(e.target.value)}
                  placeholder="2/4 OZ"
                />
              </div>

              <div>
                <Label htmlFor="dailyAmount" className="block mb-2">Daily Amount</Label>
                <Input
                  id="dailyAmount"
                  value={dailyAmount}
                  onChange={(e) => setDailyAmount(e.target.value)}
                  placeholder="3 Cups Daily"
                />
              </div>
            </div>

            {/* Category & Sub Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="block mb-2">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Eliminate Virus"
                />
              </div>

              <div>
                <Label htmlFor="secondaryCategory" className="block mb-2">Sub Category</Label>
                <Input
                  id="secondaryCategory"
                  value={secondaryCategory}
                  onChange={(e) => setSecondaryCategory(e.target.value)}
                  placeholder="Immune Support"
                />
              </div>
            </div>

            {/* Stock Level */}
            <div>
              <Label htmlFor="stockLevel" className="block mb-2">Stock Level</Label>
              <Select value={stockLevel} onValueChange={(val) => setStockLevel(val as Herb['stockLevel'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🟢 High Stock - Plenty Available</SelectItem>
                  <SelectItem value="medium">🟡 Medium Stock - Running Low</SelectItem>
                  <SelectItem value="low">🟠 Low Stock - Need to Reorder</SelectItem>
                  <SelectItem value="out">🔴 Out of Stock - Need ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ingredients */}
            <div>
              <Label htmlFor="ingredients" className="block mb-2">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="List of ingredients..."
                rows={2}
              />
            </div>

            {/* Benefits */}
            <div>
              <Label htmlFor="benefits" className="block mb-2">Benefits</Label>
              <Textarea
                id="benefits"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="Kills Cancer Cells, Boost Immune System, Anti-Inflammatory..."
                rows={3}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block mb-2">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the herb..."
                rows={3}
              />
            </div>

            {/* Preparation Instructions */}
            <div>
              <Label htmlFor="preparation" className="block mb-2">Preparation Instructions</Label>
              <Textarea
                id="preparation"
                value={preparationInstructions}
                onChange={(e) => setPreparationInstructions(e.target.value)}
                placeholder="Boil 1 cup of spring water and 1 tablespoon. Steep for 25 minutes..."
                rows={3}
              />
            </div>
            </TabsContent>

            {/* ============================================ */}
            {/* TAB 2: PURCHASE HISTORY */}
            {/* ============================================ */}
            <TabsContent value="purchases" className="space-y-4 py-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Purchase History</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Auto-populate source with herb's default supplier
                    if (!showPurchaseForm && supplier) {
                      setPurchaseSource(supplier);
                    }
                    setShowPurchaseForm(!showPurchaseForm);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Purchase
                </Button>
              </div>

              {/* Purchase Statistics */}
              {(() => {
                const stats = getPurchaseStats();
                if (stats) {
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases}</div>
                        <div className="text-xs text-gray-600">Total Purchases</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.uniqueSources}</div>
                        <div className="text-xs text-gray-600">Suppliers Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${stats.totalCost.toFixed(2)}</div>
                        <div className="text-xs text-gray-600">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-purple-600 truncate" title={stats.mostUsedSupplier?.name}>
                          {stats.mostUsedSupplier?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Top Supplier ({stats.mostUsedSupplier?.count || 0}x)
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Add Purchase Form */}
              {showPurchaseForm && (
                <Card className="mb-3 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label htmlFor="purchaseDate" className="text-sm">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseQuantity" className="text-sm">Quantity</Label>
                      <Input
                        id="purchaseQuantity"
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(e.target.value)}
                        placeholder="1 bottle, 2 oz, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseCost" className="text-sm">Cost ($)</Label>
                      <Input
                        id="purchaseCost"
                        type="number"
                        step="0.01"
                        value={purchaseCost}
                        onChange={(e) => setPurchaseCost(e.target.value)}
                        placeholder="29.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseSource" className="text-sm">Source/Store</Label>
                      <Input
                        id="purchaseSource"
                        list="suppliers-list"
                        value={purchaseSource}
                        onChange={(e) => setPurchaseSource(e.target.value)}
                        placeholder="Amazon, Local Store, etc."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={addPurchase}
                    >
                      Add Purchase
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPurchaseForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Purchase List */}
              {purchases.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                      <div className="text-sm">
                        <div className="font-medium">{purchase.date}</div>
                        <div className="text-gray-600">
                          {purchase.quantity}
                          {purchase.cost && <span> • ${purchase.cost.toFixed(2)}</span>}
                          {purchase.source && <span> • {purchase.source}</span>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePurchase(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded mt-4">
                  No purchases recorded yet. Click "Add Purchase" to track when you bought this herb.
                </p>
              )}
            </div>
          </TabsContent>
          </Tabs>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingHerb ? 'Update' : 'Save'} Herb
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* TEXT EDITOR MODAL - For long text fields */}
      {/* ============================================ */}
      <Dialog open={textEditModal.open} onOpenChange={(open) => {
        if (!open) setTextEditModal({ open: false, herbId: '', field: '', value: '' });
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {textEditModal.field}</DialogTitle>
            <DialogDescription>
              Enter the full text for this field. Changes are saved when you click Save.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={textEditModal.value}
              onChange={(e) => setTextEditModal({...textEditModal, value: e.target.value})}
              className="w-full min-h-[300px] text-sm"
              rows={12}
              placeholder={`Enter ${textEditModal.field}...`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTextEditModal({ open: false, herbId: '', field: '', value: '' })}>
              Cancel
            </Button>
            <Button onClick={saveTextFromModal}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
