import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  getHerbsFoods,
  saveHerbFood,
  deleteHerbFood,
  type HerbFood,
  type Purchase,
} from "../lib/storage";
import { importFile, generateCSVTemplate } from "../lib/csvParser";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Leaf,
  Apple,
  DollarSign,
  Store,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function HerbsAndFoods() {
  const [items, setItems] = useState<HerbFood[]>([]);
  const [filterType, setFilterType] = useState<
    "all" | "herb" | "food"
  >("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HerbFood | null>(
    null
  );
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<HerbFood | null>(
    null
  );
  const [formType, setFormType] = useState<"herb" | "food">("herb");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [showCustomSource, setShowCustomSource] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<string>("");
  const [showCustomSupplier, setShowCustomSupplier] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<
    "replace" | "merge" | "update"
  >("merge");
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadItems = async () => {
    const data = await getHerbsFoods();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (editingItem && editingItem.supplier) {
      const predefinedSuppliers = [
        "Bolingo Balance",
        "Palm International",
        "Herbology",
        "Eat To Live",
      ];
      if (predefinedSuppliers.includes(editingItem.supplier)) {
        setSelectedSupplier(editingItem.supplier);
        setShowCustomSupplier(false);
      } else {
        setSelectedSupplier("other");
        setShowCustomSupplier(true);
      }
    }
  }, [editingItem]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Get the supplier - either from select or custom input
    let supplier = selectedSupplier;
    if (selectedSupplier === "other") {
      supplier = formData.get("customSupplier") as string;
    }

    const item: HerbFood = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      category: formData.get("category") as string,
      secondaryCategory:
        (formData.get("secondaryCategory") as string) || undefined,
      benefits: formData.get("benefits") as string,
      description:
        (formData.get("description") as string) || undefined,
      ingredients:
        (formData.get("ingredients") as string) || undefined,
      dateAdded: editingItem?.dateAdded || new Date().toISOString(),
      purchases: editingItem?.purchases || [],
      supplier: supplier || undefined,
      // Add amino acid data for foods
      arginine: formData.get("arginine")
        ? parseFloat(formData.get("arginine") as string)
        : undefined,
      lysine: formData.get("lysine")
        ? parseFloat(formData.get("lysine") as string)
        : undefined,
      servingSize:
        (formData.get("servingSize") as string) || undefined,
      // Add preparation data for herbs
      preparationInstructions:
        (formData.get("preparationInstructions") as string) ||
        undefined,
      dailyServingRequirement: formData.get("dailyServingRequirement")
        ? parseFloat(
            formData.get("dailyServingRequirement") as string
          )
        : undefined,
      servingSizePerServing:
        (formData.get("servingSizePerServing") as string) ||
        undefined,
    };

    await saveHerbFood(item);
    await loadItems();
    setIsAddDialogOpen(false);
    setEditingItem(null);
    setFormType("herb");
    setSelectedSupplier("");
    setShowCustomSupplier(false);
    e.currentTarget.reset();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteHerbFood(id);
      await loadItems();
    }
  };

  const handleAddPurchase = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(e.currentTarget);

    // Get the source - either from select or custom input
    let source = selectedSource;
    if (selectedSource === "other") {
      source = formData.get("customSource") as string;
    }

    const purchase: Purchase = {
      id: Date.now().toString(),
      date: formData.get("purchaseDate") as string,
      quantity: formData.get("quantity") as string,
      cost: parseFloat(formData.get("cost") as string) || undefined,
      source: source || undefined,
    };

    const updatedItem = {
      ...selectedItem,
      purchases: [...selectedItem.purchases, purchase],
    };

    await saveHerbFood(updatedItem);
    await loadItems();
    setIsPurchaseDialogOpen(false);
    setSelectedItem(null);
    setSelectedSource("");
    setShowCustomSource(false);
    e.currentTarget.reset();
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const getLysineScore = (item: HerbFood) => {
    if (!item.lysine || !item.arginine) return null;
    return (item.lysine - item.arginine).toFixed(2);
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "herbs-foods-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportMessage(null);
      const importedItems = await importFile(file);

      if (importedItems.length === 0) {
        setImportMessage({
          type: "error",
          text: "No valid items found in file",
        });
        return;
      }

      // Handle different import modes
      if (importMode === "replace") {
        // Replace all existing items
        for (const item of importedItems) {
          await saveHerbFood(item);
        }
      } else if (importMode === "merge") {
        // Only add new items (skip if name exists)
        const existingNames = items.map((i) => i.name.toLowerCase());
        let addedCount = 0;
        for (const item of importedItems) {
          if (!existingNames.includes(item.name.toLowerCase())) {
            await saveHerbFood(item);
            addedCount++;
          }
        }
        setImportMessage({
          type: "success",
          text: `Imported ${addedCount} new items (skipped ${
            importedItems.length - addedCount
          } duplicates)`,
        });
      } else if (importMode === "update") {
        // Update existing items and add new ones
        const existingItemsMap = new Map(
          items.map((i) => [i.name.toLowerCase(), i])
        );
        for (const item of importedItems) {
          const existing = existingItemsMap.get(
            item.name.toLowerCase()
          );
          if (existing) {
            // Keep the original ID and purchases when updating
            item.id = existing.id;
            item.purchases = existing.purchases;
            item.dateAdded = existing.dateAdded;
          }
          await saveHerbFood(item);
        }
        setImportMessage({
          type: "success",
          text: `Imported ${importedItems.length} items successfully`,
        });
      }

      await loadItems();
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error("Import failed:", error);
      setImportMessage({
        type: "error",
        text: `Import failed: ${error}`,
      });
    } finally {
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-800">Herbs & Foods Catalog</h2>
          <p className="text-gray-600">
            Manage your healing ingredients
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Inventory from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to import your herbs and foods
                  inventory
                </DialogDescription>
              </DialogHeader>

              {importMessage && (
                <Alert
                  variant={
                    importMessage.type === "error"
                      ? "destructive"
                      : "default"
                  }
                >
                  {importMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {importMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label>Import Mode</Label>
                  <Select
                    value={importMode}
                    onValueChange={(value: any) =>
                      setImportMode(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">
                        Merge (Skip Duplicates)
                      </SelectItem>
                      <SelectItem value="update">
                        Update Existing & Add New
                      </SelectItem>
                      <SelectItem value="replace">
                        Replace All
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {importMode === "merge" &&
                      "Only add new items, skip items with matching names"}
                    {importMode === "update" &&
                      "Update items with matching names, add new ones"}
                    {importMode === "replace" &&
                      "WARNING: This will delete all existing items!"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="csv-upload">Select CSV or Excel File</Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportCSV}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepts CSV (.csv) and Excel (.xlsx, .xls) files
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingItem(null);
                setFormType("herb");
                setSelectedSupplier("");
                setShowCustomSupplier(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setFormType("herb");
                  setSelectedSupplier("");
                  setShowCustomSupplier(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(980px,92vw)] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Item" : "Add New Item"}
                </DialogTitle>
                <DialogDescription>
                  Add herbs or foods to your healing catalog
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingItem?.name}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      name="type"
                      defaultValue={editingItem?.type || formType}
                      onValueChange={(value) =>
                        setFormType(value as any)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="herb">Herb</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="tonic">Tonic</SelectItem>
                        <SelectItem value="herb bundle">
                          Herb Bundle
                        </SelectItem>
                        <SelectItem value="herb blend">
                          Herb Blend
                        </SelectItem>
                        <SelectItem value="tea bag">
                          Tea Bag
                        </SelectItem>
                        <SelectItem value="pills">Pills</SelectItem>
                        <SelectItem value="topical">
                          Topical
                        </SelectItem>
                        <SelectItem value="supplement">
                          Supplement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingItem?.category}
                      placeholder="e.g., Anti-inflammatory, Digestive"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryCategory">
                      Secondary Category (Optional)
                    </Label>
                    <Input
                      id="secondaryCategory"
                      name="secondaryCategory"
                      defaultValue={editingItem?.secondaryCategory}
                      placeholder="e.g., Adaptogen, Immune Support"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ingredients">
                    Ingredients (Optional)
                  </Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    defaultValue={editingItem?.ingredients}
                    placeholder="List of ingredients..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    name="benefits"
                    defaultValue={editingItem?.benefits}
                    placeholder="Describe the healing benefits..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingItem?.description}
                    placeholder="Detailed description of the product..."
                    rows={3}
                  />
                </div>

                {/* Show amino acid fields for foods */}
                {(formType === "food" ||
                  editingItem?.type === "food") && (
                  <div className="border-t pt-4 space-y-4">
                    <p className="text-sm text-gray-600">
                      Amino Acid Content (per serving)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lysine">Lysine (mg)</Label>
                        <Input
                          id="lysine"
                          name="lysine"
                          type="number"
                          step="0.01"
                          defaultValue={editingItem?.lysine}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="arginine">
                          Arginine (mg)
                        </Label>
                        <Input
                          id="arginine"
                          name="arginine"
                          type="number"
                          step="0.01"
                          defaultValue={editingItem?.arginine}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="servingSize">
                        Serving Size
                      </Label>
                      <Input
                        id="servingSize"
                        name="servingSize"
                        defaultValue={editingItem?.servingSize}
                        placeholder="e.g., 100g, 1 cup"
                      />
                    </div>
                  </div>
                )}

                {/* Show preparation fields for herbs */}
                {(formType === "herb" ||
                  editingItem?.type === "herb") && (
                  <div className="border-t pt-4 space-y-4">
                    <p className="text-sm text-gray-600">
                      Preparation & Requirements
                    </p>
                    <div>
                      <Label htmlFor="preparationInstructions">
                        Preparation Instructions
                      </Label>
                      <Textarea
                        id="preparationInstructions"
                        name="preparationInstructions"
                        defaultValue={
                          editingItem?.preparationInstructions
                        }
                        placeholder="e.g., Boil 1-2 tablespoons with 2 cups of spring water for 25 minutes, steep for 10 minutes"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dailyServingRequirement">
                          Daily Servings Required
                        </Label>
                        <Input
                          id="dailyServingRequirement"
                          name="dailyServingRequirement"
                          type="number"
                          defaultValue={
                            editingItem?.dailyServingRequirement
                          }
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="servingSizePerServing">
                          Serving Size
                        </Label>
                        <Input
                          id="servingSizePerServing"
                          name="servingSizePerServing"
                          defaultValue={
                            editingItem?.servingSizePerServing
                          }
                          placeholder="e.g., 1 cup, 1-2 tbsp"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select
                    name="supplier"
                    value={selectedSupplier}
                    onValueChange={(value) => {
                      setSelectedSupplier(value);
                      if (value === "other") {
                        setShowCustomSupplier(true);
                      } else {
                        setShowCustomSupplier(false);
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bolingo Balance">
                        Bolingo Balance
                      </SelectItem>
                      <SelectItem value="Palm International">
                        Palm International
                      </SelectItem>
                      <SelectItem value="Herbology">
                        Herbology
                      </SelectItem>
                      <SelectItem value="Eat To Live">
                        Eat To Live
                      </SelectItem>
                      <SelectItem value="other">
                        Other (Fill In)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {showCustomSupplier && (
                    <Input
                      id="customSupplier"
                      name="customSupplier"
                      placeholder="Enter custom supplier name"
                      className="mt-2"
                      required
                    />
                  )}
                </div>

                <Button type="submit" className="w-full">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          onClick={() => setFilterType("all")}
        >
          All
        </Button>
        <Button
          variant={filterType === "herb" ? "default" : "outline"}
          onClick={() => setFilterType("herb")}
        >
          <Leaf className="w-4 h-4 mr-2" />
          Herbs
        </Button>
        <Button
          variant={filterType === "food" ? "default" : "outline"}
          onClick={() => setFilterType("food")}
        >
          <Apple className="w-4 h-4 mr-2" />
          Foods
        </Button>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              No items yet. Start building your catalog!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const lysineScore = getLysineScore(item);
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {item.type === "herb" ? (
                          <Leaf className="w-5 h-5 text-green-600" />
                        ) : (
                          <Apple className="w-5 h-5 text-red-600" />
                        )}
                        {item.name}
                      </CardTitle>
                      <CardDescription>
                        {item.category}
                        {item.secondaryCategory && (
                          <span className="text-gray-500">
                            {" "}
                            • {item.secondaryCategory}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        item.type === "herb" ? "default" : "secondary"
                      }
                    >
                      {item.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">
                    {item.benefits}
                  </p>

                  {/* Show supplier */}
                  {item.supplier && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Store className="w-4 h-4" />
                      <span>{item.supplier}</span>
                    </div>
                  )}

                  {/* Show lysine score for foods */}
                  {item.type === "food" && lysineScore !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Lysine Score</span>
                        <span
                          className={`${
                            parseFloat(lysineScore) > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {lysineScore} mg
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Lysine:</span>
                          <span>{item.lysine} mg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arginine:</span>
                          <span>{item.arginine} mg</span>
                        </div>
                        {item.servingSize && (
                          <div className="flex justify-between mt-1 pt-1 border-t border-blue-200">
                            <span>Serving:</span>
                            <span>{item.servingSize}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show latest purchase info for herbs */}
                  {item.type === "herb" &&
                    item.purchases.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Latest Purchase:
                        </p>
                        {(() => {
                          const latest =
                            item.purchases[item.purchases.length - 1];
                          return (
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Store className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-700">
                                  {latest.source || "Unknown source"}
                                </span>
                              </div>
                              {latest.cost && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-700">
                                    ${latest.cost.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  latest.date
                                ).toLocaleDateString()}{" "}
                                • {latest.quantity}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">
                      {item.purchases.length} purchase
                      {item.purchases.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex gap-2">
                      {item.type === "herb" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsPurchaseDialogOpen(true);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setFormType(item.type);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {item.purchases.length > 1 && (
                    <details className="pt-2 border-t">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                        View all purchases
                      </summary>
                      <div className="space-y-2 mt-2">
                        {item.purchases
                          .slice()
                          .reverse()
                          .map((purchase) => (
                            <div
                              key={purchase.id}
                              className="text-xs text-gray-700 bg-gray-50 p-2 rounded"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div>
                                    {new Date(
                                      purchase.date
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-gray-500">
                                    {purchase.quantity}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {purchase.cost && (
                                    <div>
                                      ${purchase.cost.toFixed(2)}
                                    </div>
                                  )}
                                  {purchase.source && (
                                    <div className="text-gray-500">
                                      {purchase.source}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Purchase</DialogTitle>
            <DialogDescription>
              Record a purchase for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPurchase} className="space-y-4">
            <div>
              <Label htmlFor="purchaseDate">Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                placeholder="e.g., 100g, 2 bottles"
                required
              />
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="source">Source / Store</Label>
              <Select
                name="source"
                value={selectedSource}
                onValueChange={(value) => {
                  setSelectedSource(value);
                  if (value === "other") {
                    setShowCustomSource(true);
                  } else {
                    setShowCustomSource(false);
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bolingo Balance">
                    Bolingo Balance
                  </SelectItem>
                  <SelectItem value="Palm International">
                    Palm International
                  </SelectItem>
                  <SelectItem value="Herbology">Herbology</SelectItem>
                  <SelectItem value="Eat To Live">
                    Eat To Live
                  </SelectItem>
                  <SelectItem value="other">
                    Other (Fill In)
                  </SelectItem>
                </SelectContent>
              </Select>
              {showCustomSource && (
                <Input
                  id="customSource"
                  name="customSource"
                  placeholder="Enter custom source name"
                  className="mt-2"
                  required
                />
              )}
            </div>

            <Button type="submit" className="w-full">
              Add Purchase
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
