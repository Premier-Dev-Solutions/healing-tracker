import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { getFoods, saveFood, deleteFood, type Food, type Purchase } from "../lib/storage";
import { Plus, Trash2, Edit, ShoppingCart, Search as SearchIcon, Grid, Table } from "lucide-react";
import { calculateRatio, getRatioQuality } from "../lib/usdaApi";
import { useAuth } from "../stores/authStore";
import { syncDeleteFood } from "../lib/sync";

/**
 * FOODS COMPONENT
 * Manages food inventory with lysine/arginine tracking for HSV management
 */
export function Foods() {
  // Auth state
  const { user } = useAuth();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Foods List
  const [foods, setFoods] = useState<Food[]>([]);

  // Form Fields
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [lysine, setLysine] = useState("");
  const [arginine, setArginine] = useState("");
  const [supplier, setSupplier] = useState("");
  const [stockLevel, setStockLevel] = useState<Food['stockLevel']>("high");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");

  // Purchase Management
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseSource, setPurchaseSource] = useState("");

  // Dialog Tab State
  const [dialogTab, setDialogTab] = useState("details");

  // Supplier Management
  const [allSuppliers, setAllSuppliers] = useState<string[]>([]);

  // View Mode
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [filterRatio, setFilterRatio] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-newest");

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const data = await getFoods();
    const sorted = data.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    setFoods(sorted);

    // Extract unique suppliers
    const suppliers = Array.from(new Set(data.map(f => f.supplier).filter(Boolean))) as string[];
    setAllSuppliers(suppliers);
  };

  // ============================================
  // FORM HANDLERS
  // ============================================

  const resetForm = () => {
    setName("");
    setCategory("");
    setServingSize("");
    setLysine("");
    setArginine("");
    setSupplier("");
    setStockLevel("high");
    setNotes("");
    setDescription("");
    setIngredients("");
    setPurchases([]);
    setEditingFood(null);
    setShowPurchaseForm(false);
    setDialogTab("details");
  };

  const openEditDialog = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setCategory(food.category || "");
    setServingSize(food.servingSize);
    setLysine(food.lysine.toString());
    setArginine(food.arginine.toString());
    setSupplier(food.supplier || "");
    setStockLevel(food.stockLevel || "high");
    setNotes(food.notes || "");
    setDescription(food.description || "");
    setIngredients(food.ingredients || "");
    setPurchases(food.purchases || []);
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a food name");
      return;
    }

    const food: Food = {
      id: editingFood?.id || Date.now().toString(),
      name: name.trim(),
      category: category.trim() || undefined,
      servingSize: servingSize.trim(),
      lysine: parseFloat(lysine) || 0,
      arginine: parseFloat(arginine) || 0,
      supplier: supplier.trim() || undefined,
      stockLevel: stockLevel,
      notes: notes.trim() || undefined,
      description: description.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      dateAdded: editingFood?.dateAdded || new Date().toISOString(),
      purchases: purchases
    };

    await saveFood(food);
    await loadFoods();
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this food?")) {
      await deleteFood(id);
      if (user) {
        await syncDeleteFood(user.id, id);
      }
      await loadFoods();
    }
  };

  // ============================================
  // PURCHASE MANAGEMENT
  // ============================================

  const addPurchase = () => {
    if (!purchaseDate || !purchaseQuantity) {
      alert("Please enter date and quantity");
      return;
    }

    const purchase: Purchase = {
      id: Date.now().toString(),
      date: purchaseDate,
      quantity: purchaseQuantity,
      cost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      source: purchaseSource || undefined
    };

    setPurchases([...purchases, purchase]);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseQuantity("");
    setPurchaseCost("");
    setPurchaseSource("");
    setShowPurchaseForm(false);
  };

  const deletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getStockBadge = (level?: Food['stockLevel']) => {
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

  const getPurchaseStats = () => {
    if (purchases.length === 0) return null;

    const totalPurchases = purchases.length;
    const totalCost = purchases.reduce((sum, p) => sum + (p.cost || 0), 0);
    const sources = purchases.map(p => p.source).filter(Boolean);
    const uniqueSources = new Set(sources).size;

    const sourceCounts: Record<string, number> = {};
    sources.forEach(source => {
      if (source) sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    const mostUsedSupplier = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalPurchases,
      totalCost,
      uniqueSources,
      mostUsedSupplier: mostUsedSupplier ? { name: mostUsedSupplier[0], count: mostUsedSupplier[1] } : null
    };
  };

  // ============================================
  // FILTERING AND SORTING
  // ============================================

  const getFilteredAndSortedFoods = () => {
    let filtered = [...foods];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.category?.toLowerCase().includes(query) ||
        food.ingredients?.toLowerCase().includes(query) ||
        food.notes?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(food => food.category === filterCategory);
    }

    // Supplier filter
    if (filterSupplier !== "all") {
      filtered = filtered.filter(food => food.supplier === filterSupplier);
    }

    // Stock level filter
    if (filterStock !== "all") {
      filtered = filtered.filter(food => food.stockLevel === filterStock);
    }

    // Ratio filter
    if (filterRatio !== "all") {
      filtered = filtered.filter(food => {
        const ratio = calculateRatio(food.lysine, food.arginine);
        const quality = getRatioQuality(ratio);
        return quality.level === filterRatio;
      });
    }

    // Sorting
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
      case "lysine-highest":
        filtered.sort((a, b) => b.lysine - a.lysine);
        break;
      case "arginine-lowest":
        filtered.sort((a, b) => a.arginine - b.arginine);
        break;
      case "ratio-best":
        filtered.sort((a, b) => {
          const ratioA = calculateRatio(a.lysine, a.arginine);
          const ratioB = calculateRatio(b.lysine, b.arginine);
          return ratioB - ratioA;
        });
        break;
      case "purchases-most":
        filtered.sort((a, b) => (b.purchases?.length || 0) - (a.purchases?.length || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredFoods = getFilteredAndSortedFoods();

  // ============================================
  // METRICS
  // ============================================

  const getMetrics = () => {
    const totalFoods = foods.length;

    // Count by category
    const categoryCounts: Record<string, number> = {};
    foods.forEach(food => {
      if (food.category) {
        categoryCounts[food.category] = (categoryCounts[food.category] || 0) + 1;
      }
    });
    const mostCommonCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    // Total investment
    const totalInvested = foods.reduce((sum, food) => {
      const foodCost = food.purchases?.reduce((s, p) => s + (p.cost || 0), 0) || 0;
      return sum + foodCost;
    }, 0);

    // Unique suppliers
    const uniqueSuppliers = new Set(foods.map(f => f.supplier).filter(Boolean));

    // Foods with purchases
    const foodsWithPurchases = foods.filter(f => f.purchases && f.purchases.length > 0).length;

    // High lysine foods (ratio > 2.0)
    const highLysineFoods = foods.filter(f => {
      const ratio = calculateRatio(f.lysine, f.arginine);
      return ratio >= 2.0;
    }).length;

    // Recent purchases
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPurchases = foods.filter(food =>
      food.purchases?.some(p => new Date(p.date) >= thirtyDaysAgo)
    ).length;

    // Total purchases
    const totalPurchases = foods.reduce((sum, food) => sum + (food.purchases?.length || 0), 0);

    return {
      totalFoods,
      mostCommonCategory: mostCommonCategory ? { category: mostCommonCategory[0], count: mostCommonCategory[1] } : null,
      totalInvested,
      uniqueSuppliers: uniqueSuppliers.size,
      foodsWithPurchases,
      highLysineFoods,
      recentPurchases,
      totalPurchases
    };
  };

  const metrics = getMetrics();

  // Get unique categories for filter
  const allCategories = Array.from(new Set(foods.map(f => f.category).filter(Boolean))) as string[];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Food Inventory</h2>
          <p className="text-gray-600">Track foods and lysine/arginine ratios for HSV management</p>
        </div>

        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <Input
                placeholder="Search foods by name, category, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px]">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
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

              <div className="flex-1 min-w-[200px]">
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

              <div className="flex-1 min-w-[200px]">
                <Select value={filterRatio} onValueChange={setFilterRatio}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratios</SelectItem>
                    <SelectItem value="good">💚 Good Ratio (&gt;2.0)</SelectItem>
                    <SelectItem value="moderate">🟡 Moderate Ratio (1.0-2.0)</SelectItem>
                    <SelectItem value="poor">🔴 Poor Ratio (&lt;1.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
                    <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="ratio-best">Best Ratio First</SelectItem>
                    <SelectItem value="lysine-highest">Highest Lysine</SelectItem>
                    <SelectItem value="arginine-lowest">Lowest Arginine</SelectItem>
                    <SelectItem value="purchases-most">Most Purchased</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || filterCategory !== "all" || filterSupplier !== "all" || filterStock !== "all" || filterRatio !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory("all");
                    setFilterSupplier("all");
                    setFilterStock("all");
                    setFilterRatio("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Counter */}
            <div className="text-sm text-gray-600">
              Showing <strong>{filteredFoods.length}</strong> of <strong>{foods.length}</strong> foods
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Foods for HSV Alert - High Ratio Foods */}
      {(() => {
        const bestFoods = foods
          .filter(f => {
            const ratio = calculateRatio(f.lysine, f.arginine);
            return ratio >= 2.0;
          })
          .sort((a, b) => {
            const ratioA = calculateRatio(a.lysine, a.arginine);
            const ratioB = calculateRatio(b.lysine, b.arginine);
            return ratioB - ratioA;
          })
          .slice(0, 5);

        if (bestFoods.length === 0) return null;

        return (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-green-600">💚 Best Foods for HSV</span>
                <Badge className="bg-green-600 text-white">{bestFoods.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bestFoods.map(food => {
                  const ratio = calculateRatio(food.lysine, food.arginine);
                  const ratioQuality = getRatioQuality(ratio);
                  return (
                    <div key={food.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{ratioQuality.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-600">
                            Ratio: {ratio.toFixed(2)} • Lysine: {food.lysine}mg • Arginine: {food.arginine}mg
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(food)}
                      >
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Needs Reorder Alert */}
      {(() => {
        const needsReorder = foods.filter(f => f.stockLevel === 'low' || f.stockLevel === 'out');
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
                {needsReorder.map(food => {
                  const badge = getStockBadge(food.stockLevel);
                  return (
                    <div key={food.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-600">
                            {food.category} {food.supplier && `• ${food.supplier}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(food)}
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

      {/* Metrics Dashboard */}
      {!searchQuery && filterCategory === "all" && filterSupplier === "all" && filterStock === "all" && filterRatio === "all" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalFoods}</div>
                <div className="text-xs text-gray-600 mt-1">Total Foods</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{metrics.mostCommonCategory?.count || 0}</div>
                <div className="text-xs text-gray-600 mt-1">{metrics.mostCommonCategory?.category || 'N/A'}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${metrics.totalInvested.toFixed(0)}</div>
                <div className="text-xs text-gray-600 mt-1">Total Invested</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{metrics.uniqueSuppliers}</div>
                <div className="text-xs text-gray-600 mt-1">Suppliers</div>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{metrics.foodsWithPurchases}</div>
                <div className="text-xs text-gray-600 mt-1">With Purchases</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{metrics.highLysineFoods}</div>
                <div className="text-xs text-gray-600 mt-1">High Lysine</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{metrics.recentPurchases}</div>
                <div className="text-xs text-gray-600 mt-1">Recent (30d)</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{metrics.totalPurchases}</div>
                <div className="text-xs text-gray-600 mt-1">All Purchases</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CARD VIEW */}
      {viewMode === "cards" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => {
              const ratio = calculateRatio(food.lysine, food.arginine);
              const ratioQuality = getRatioQuality(ratio);
              const stockBadge = getStockBadge(food.stockLevel);

              return (
                <Card key={food.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{food.name}</CardTitle>
                        <div className="mt-1 flex flex-wrap gap-2 items-center">
                          {food.category && <Badge variant="outline">{food.category}</Badge>}
                          {food.stockLevel && (
                            <Badge className={`border ${stockBadge.color}`}>
                              {stockBadge.icon} {stockBadge.label}
                            </Badge>
                          )}
                          <Badge className={`border ${ratioQuality.color}`}>
                            {ratioQuality.icon} {ratioQuality.label}: {ratio.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(food)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(food.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-gray-500">Lysine</div>
                        <div className="font-semibold text-green-600">{food.lysine}mg</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Arginine</div>
                        <div className="font-semibold text-red-600">{food.arginine}mg</div>
                      </div>
                    </div>
                    <div>
                      <strong>Serving:</strong> {food.servingSize}
                    </div>
                    {food.supplier && (
                      <div>
                        <strong>Supplier:</strong> {food.supplier}
                      </div>
                    )}
                    {food.notes && (
                      <div className="pt-2 border-t">
                        <strong>Notes:</strong>
                        <p className="text-gray-600 mt-1 line-clamp-2">{food.notes}</p>
                      </div>
                    )}
                    {food.purchases && food.purchases.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ShoppingCart className="h-3 w-3" />
                          <span>{food.purchases.length} purchase(s)</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredFoods.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                {foods.length === 0
                  ? "No foods yet. Click 'Add Food' to get started."
                  : "No foods match your search or filters. Try adjusting your criteria."}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* TABLE VIEW - Coming Soon */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            Table view coming soon...
          </CardContent>
        </Card>
      )}

      {/* ADD/EDIT DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFood ? "Edit Food" : "Add New Food"}</DialogTitle>
          </DialogHeader>

          <Tabs value={dialogTab} onValueChange={setDialogTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Food Details</TabsTrigger>
              <TabsTrigger value="purchases">Purchase History ({purchases.length})</TabsTrigger>
            </TabsList>

            {/* TAB 1: FOOD DETAILS */}
            <TabsContent value="details" className="space-y-4 py-4">
              {/* Food Name */}
              <div>
                <Label htmlFor="name" className="block mb-2">Food Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chicken Breast"
                  required
                />
              </div>

              {/* Category & Serving Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="block mb-2">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Protein, Vegetables, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="servingSize" className="block mb-2">Serving Size *</Label>
                  <Input
                    id="servingSize"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="100g, 1 cup, etc."
                    required
                  />
                </div>
              </div>

              {/* Lysine & Arginine */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lysine" className="block mb-2">Lysine (mg) *</Label>
                  <Input
                    id="lysine"
                    type="number"
                    step="0.1"
                    value={lysine}
                    onChange={(e) => setLysine(e.target.value)}
                    placeholder="2200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="arginine" className="block mb-2">Arginine (mg) *</Label>
                  <Input
                    id="arginine"
                    type="number"
                    step="0.1"
                    value={arginine}
                    onChange={(e) => setArginine(e.target.value)}
                    placeholder="680"
                    required
                  />
                </div>
              </div>

              {/* Ratio Preview */}
              {lysine && arginine && (
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm font-medium mb-2">Lysine/Arginine Ratio Preview:</div>
                  {(() => {
                    const ratio = calculateRatio(parseFloat(lysine) || 0, parseFloat(arginine) || 0);
                    const quality = getRatioQuality(ratio);
                    return (
                      <Badge className={`border ${quality.color}`}>
                        {quality.icon} {quality.label}: {ratio.toFixed(2)}
                      </Badge>
                    );
                  })()}
                </div>
              )}

              {/* Supplier & Stock Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier" className="block mb-2">Supplier/Store</Label>
                  <Input
                    id="supplier"
                    list="suppliers-list-food"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Whole Foods, Target, etc."
                  />
                  <datalist id="suppliers-list-food">
                    {allSuppliers.map((sup: string) => (
                      <option key={sup} value={sup} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="stockLevel" className="block mb-2">Stock Level</Label>
                  <Select value={stockLevel} onValueChange={(val) => setStockLevel(val as Food['stockLevel'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🟢 High Stock</SelectItem>
                      <SelectItem value="medium">🟡 Medium Stock</SelectItem>
                      <SelectItem value="low">🟠 Low Stock</SelectItem>
                      <SelectItem value="out">🔴 Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <Label htmlFor="ingredients" className="block mb-2">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="For processed foods..."
                  rows={2}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="block mb-2">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="block mb-2">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Personal notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingFood ? "Update Food" : "Add Food"}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: PURCHASE HISTORY */}
            <TabsContent value="purchases" className="space-y-4 py-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Purchase History</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
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
                          placeholder="2 lbs, 1 package, etc."
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
                          placeholder="12.99"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchaseSource" className="text-sm">Source/Store</Label>
                        <Input
                          id="purchaseSource"
                          list="suppliers-list-food"
                          value={purchaseSource}
                          onChange={(e) => setPurchaseSource(e.target.value)}
                          placeholder="Whole Foods, etc."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={addPurchase}>
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
                    No purchases recorded yet. Click "Add Purchase" to track when you bought this food.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
