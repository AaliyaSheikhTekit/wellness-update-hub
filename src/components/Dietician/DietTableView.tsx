import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import IkshaLogo from "../../assets/iksha_logo.png";
import { 
  medicatedWaters, 
  quathAndTeas, 
  sprouts, 
  dryFruits, 
  fruits, 
  vegetables, 
  rotis, 
  pulses,
  juices,
  cookedBreakfast
} from '@/data/dietData';
import { 
  Calendar as CalendarIcon, 
  Copy, 
  Clipboard, 
  ChevronLeft, 
  ChevronRight, 
  Save,
  Download,
  Send,
  Plus,
  Trash2,
  Loader2,
  Printer
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  getDiet,
  createWeeklyDietPlan, 
  getDietPlan, 
  getBackendToken
} from "@/lib/api";

interface MealPlan {
  [date: string]: {
    [mealTime: string]: {
      text: string;
      itemIds: string[];
    };
  };
}

interface DietTableViewProps {
  patientId: string;
  patientName: string;
}

interface DietItem {
  id: string;
  name: string;
  subForm?: string;
  category?: {
    id: string;
    name: string;
  };
  subCategory?: {
    id: string;
    name: string;
  };
}

interface DietCategory {
  id: string;
  name: string;
  subCategories: DietSubCategory[];
}

interface DietSubCategory {
  id: string;
  name: string;
  items: DietItem[];
}

const mealTimings = [
  { time: "04:30AM-05:00AM", label: "Early Morning", placeholder: "Pranayam" },
  { time: "07:30AM-08:00AM", label: "Yoga Time", placeholder: "Yoga" },
  { time: "08:00AM-09:00AM", label: "Breakfast", placeholder: "Breakfast" },
  { time: "11:00AM-01:00PM", label: "Mid-Morning", placeholder: "Snack" },
  { time: "01:30PM-02:30PM", label: "Lunch", placeholder: "Lunch" },
  { time: "05:00PM-06:00PM", label: "Evening", placeholder: "Concern" },
  { time: "07:30PM-08:30PM", label: "Dinner", placeholder: "Dinner" },
  { time: "08:30PM", label: "Before Sleep", placeholder: "Night" }
];

const DietTableView = ({ patientId, patientName }: DietTableViewProps) => {
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mealPlans, setMealPlans] = useState<MealPlan>({});
  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ date: string; time: string } | null>(null);
  const [dietItems, setDietItems] = useState<DietCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  // Load diet items from API
  useEffect(() => {
    const loadDietItems = async () => {
      try {
        const response = await getDiet({ limit: 1000 });
        setDietItems(
          (response.data || []).map((cat: any) => ({
            ...cat,
            subCategories: (cat.subCategories || []).map((sub: any) => ({
              ...sub,
              items: sub.items ?? [],
            })),
          }))
        );
      } catch (error) {
        console.error("Error loading diet items:", error);
        toast({
          title: "Error",
          description: "Failed to load diet items",
          variant: "destructive",
        });
      }
    };
    loadDietItems();
  }, [toast]);

  // Load existing diet plan for the week
  useEffect(() => {
    const loadWeeklyPlan = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const startDate = format(currentWeekStart, "yyyy-MM-dd");
        const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");
        
        const response = await getDietPlan(patientId, startDate, endDate);
        
        if (response.data) {
          const transformed: MealPlan = {};
          response.data.forEach((plan: any) => {
            const dateKey = format(new Date(plan.date), "yyyy-MM-dd");
            if (!transformed[dateKey]) {
              transformed[dateKey] = {};
            }
            
            if (plan.dietPlanItem) {
              const itemNames = plan.dietPlanItem.dietItem
                .map((item: any) => item.name || item.shortForm)
                .join(", ");
              
              const itemIds = plan.dietPlanItem.dietItem.map((item: any) => item.id);
              
              transformed[dateKey][plan.dietPlanItem.time] = {
                text: itemNames,
                itemIds: itemIds,
              };
            }
          });
          setMealPlans(transformed);
        }
      } catch (error) {
        console.error("Error loading diet plan:", error);
        toast({
          title: "Error",
          description: "Failed to load existing diet plan",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyPlan();
  }, [patientId, currentWeekStart, toast]);

  const updateMealPlan = (date: Date, mealTime: string, content: string) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealTime]: {
          text: content,
          itemIds: prev[dateKey]?.[mealTime]?.itemIds || [],
        }
      }
    }));
  };

  const addDietItemToMeal = (date: Date, mealTime: string, itemId: string, itemName: string) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => {
      const currentMeal = prev[dateKey]?.[mealTime];
      const currentText = currentMeal?.text || "";
      const currentIds = currentMeal?.itemIds || [];
      
      if (currentIds.includes(itemId)) return prev;
      
      const newText = currentText ? `${currentText}, ${itemName}` : itemName;
      
      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: {
            text: newText,
            itemIds: [...currentIds, itemId],
          }
        }
      };
    });
  };

  const copyDayPlan = (date: Date) => {
    const dateKey = getDateKey(date);
    setCopiedDay(dateKey);
    toast({
      title: "Copied",
      description: `Diet plan for ${format(date, "MMM d")} copied`,
    });
  };

  const pasteDayPlan = (targetDate: Date) => {
    if (!copiedDay) return;
    
    const targetKey = getDateKey(targetDate);
    setMealPlans(prev => ({
      ...prev,
      [targetKey]: { ...prev[copiedDay] }
    }));
    toast({
      title: "Pasted",
      description: `Diet plan pasted to ${format(targetDate, "MMM d")}`,
    });
  };

  const clearDayPlan = (date: Date) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => {
      const updated = { ...prev };
      delete updated[dateKey];
      return updated;
    });
    toast({
      title: "Cleared",
      description: `Diet plan for ${format(date, "MMM d")} cleared`,
    });
  };

  const saveWeeklyPlan = async () => {
    setSaving(true);
    try {
      const planItems: any[] = [];
      
      weekDays.forEach((date) => {
        const dateKey = getDateKey(date);
        const dayPlan = mealPlans[dateKey];
        
        if (dayPlan) {
          Object.entries(dayPlan).forEach(([time, meal]) => {
            if (meal.itemIds && meal.itemIds.length > 0) {
              const isoDate = new Date(date);
              const timeMatch = time.match(/(\d{1,2}):(\d{2})(AM|PM)/);
              
              if (timeMatch) {
                let hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const period = timeMatch[3];
                
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                isoDate.setHours(hours, minutes, 0, 0);
              }
              
              planItems.push({
                date: isoDate.toISOString(),
                patientId: patientId,
                dietPlanItem: {
                  time: time,
                  dietItem: meal.itemIds,
                }
              });
            }
          });
        }
      });

      if (planItems.length === 0) {
        toast({
          title: "No Changes",
          description: "No diet items to save",
          variant: "destructive",
        });
        return;
      }

const backendToken = getBackendToken();      
      for (const planItem of planItems) {
        const response = await fetch('https://api.ikshanaturopathy.com/v1/diet-plan/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planItem),
        });

        if (!response.ok) {
          throw new Error(`Failed to save diet plan for ${planItem.date}`);
        }
      }
      
      toast({
        title: "Success",
        description: `Successfully saved ${planItems.length} diet plan entries!`,
      });
    } catch (error) {
      console.error("Error saving diet plan:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save diet plan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToPreviousWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const QuickAddDialog = ({ date, time }: { date: Date; time: string }) => {
    const [open, setOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Flatten items for filtering
    const allItems: (DietItem & { categoryName: string; subCategoryName: string })[] = [];
    dietItems.forEach(category => {
      category.subCategories.forEach(subCategory => {
        subCategory.items.forEach(item => {
          allItems.push({
            ...item,
            categoryName: category.name,
            subCategoryName: subCategory.name,
          });
        });
      });
    });

    const filteredItems = allItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subForm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleItem = (itemId: string) => {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    };

    const addSelectedItems = () => {
      selectedItems.forEach(itemId => {
        const item = allItems.find(i => i.id === itemId);
        if (item) {
          addDietItemToMeal(date, time, item.id, item.subForm || item.name);
        }
      });
      setSelectedItems([]);
      setSearchQuery("");
      setOpen(false);
    };

    // Group by category and subcategory
    const groupedByCategory: Record<string, Record<string, typeof allItems>> = {};
    
    if (searchQuery) {
      // When searching, show flat filtered results grouped by category
      filteredItems.forEach(item => {
        if (!groupedByCategory[item.categoryName]) {
          groupedByCategory[item.categoryName] = {};
        }
        if (!groupedByCategory[item.categoryName][item.subCategoryName]) {
          groupedByCategory[item.categoryName][item.subCategoryName] = [];
        }
        groupedByCategory[item.categoryName][item.subCategoryName].push(item);
      });
    } else {
      // When not searching, show all items grouped properly
      dietItems.forEach(category => {
        groupedByCategory[category.name] = {};
        category.subCategories.forEach(subCategory => {
          groupedByCategory[category.name][subCategory.name] = subCategory.items.map(item => ({
            ...item,
            categoryName: category.name,
            subCategoryName: subCategory.name,
          }));
        });
      });
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add Food Items to {format(date, "MMM d")} - {time}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by item name, short form, category, or subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-md">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <Button size="sm" onClick={addSelectedItems} className="bg-blue-600 hover:bg-blue-700">
                  Add Selected Items
                </Button>
              </div>
            )}

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedByCategory).map(([categoryName, subCategories]) => (
                  <div key={categoryName} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
                      📂 {categoryName}
                    </h3>
                    
                    <div className="space-y-4">
                      {Object.entries(subCategories).map(([subCategoryName, items]) => (
                        <div key={subCategoryName} className="ml-2">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-blue-600">└─</span> {subCategoryName} 
                            <span className="text-xs text-gray-500 font-normal">({items.length} items)</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-2 ml-4">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                  selectedItems.includes(item.id) 
                                    ? 'bg-blue-50 border-blue-400 shadow-sm' 
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => toggleItem(item.id)}
                                  className="w-4 h-4 mt-0.5 text-blue-600 rounded cursor-pointer flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900 truncate">
                                    {item.name}
                                  </div>
                                  {item.subForm && (
                                    <div className="text-xs text-blue-600 font-medium mt-1">
                                      {item.subForm}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(groupedByCategory).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="font-medium">No diet items found</div>
                    <div className="text-sm mt-1">Try adjusting your search</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setOpen(false);
              setSelectedItems([]);
              setSearchQuery("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={addSelectedItems}
              disabled={selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add {selectedItems.length > 0 && `(${selectedItems.length})`} Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const printTableWithHeaderFooter = (tableId: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;

    const newWindow = window.open("", "_blank", "width=1000,height=800");
    newWindow!.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .header, .footer { width: 100%; text-align: center; margin: 10px 0; }
            .footer { font-size: 10px; color: #555; }
            img { max-height: 80px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:4px solid #F59E0B; padding-bottom:10px;">
              <div>
                <img src="${IkshaLogo}" alt="Iksha Logo" style="height: 80px;" />
                <p style="font-size:12px; color:#555;">Integrated Natural Healing system for a comprehensive</p>
              </div>
              <div style="text-align:right; font-size:12px;">
                <p>📞 +91 9343922950</p>
                <p>📧 admin@ikshanaturopathy.com</p>
                <p>📍 Bhopal, Madhya Pradesh</p>
              </div>
            </div>
          </div>

          ${table.outerHTML}

          <div class="footer">
            <p>Integrated Natural Healing system for a comprehensive</p>
            <p>📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
            <p>© ${new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);
    newWindow!.document.close();
    newWindow!.print();
  };

  return (
    <div className="space-y-4">
      <Card id='diet-table' className="wellness-card wellness-shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-wellness-primary mb-1">
                <CalendarIcon className="w-5 h-5" />
                Weekly Diet Plan - {patientName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Week: {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {copiedDay && (
                <Badge variant="secondary" className="mr-2">
                  <Clipboard className="w-3 h-3 mr-1" />
                  Copied: {format(new Date(copiedDay), "EEE, MMM d")}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="wellness" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="border rounded-lg bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-wellness-primary/10">
                <th className="border border-wellness-muted p-2 text-left font-semibold text-sm sticky left-0 bg-wellness-primary/10 z-10 min-w-[140px]">
                  Date
                </th>
                {mealTimings.map((meal, idx) => (
                  <th 
                    key={idx} 
                    className="border border-wellness-muted p-2 text-center font-semibold text-xs min-w-[150px]"
                  >
                    <div>{meal.time}</div>
                    <div className="text-xs font-normal text-muted-foreground mt-1">
                      ({meal.label})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekDays.map((date, dateIdx) => {
                const dateKey = getDateKey(date);
                const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                return (
                  <tr 
                    key={dateIdx} 
                    className={`hover:bg-wellness-soft/30 transition-colors ${
                      isToday ? 'bg-wellness-soft/50' : ''
                    }`}
                  >
                    <td className="border border-wellness-muted p-2 sticky left-0 bg-white dark:bg-card z-10">
                      <div className="flex flex-col gap-1">
                        <div className={`font-semibold text-sm ${isToday ? 'text-wellness-primary' : ''}`}>
                          {format(date, "dd/MM/yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(date, "EEEE")}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => copyDayPlan(date)}
                            title="Copy day"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => pasteDayPlan(date)}
                            disabled={!copiedDay}
                            title="Paste day"
                          >
                            <Clipboard className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => clearDayPlan(date)}
                            title="Clear day"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </td>
                    {mealTimings.map((meal, mealIdx) => {
                      const content = mealPlans[dateKey]?.[meal.time]?.text || "";
                      
                      return (
                        <td 
                          key={mealIdx} 
                          className="border border-wellness-muted p-1 align-top"
                        >
                          <div className="relative group">
                            <Textarea
                              value={content}
                              onChange={(e) => updateMealPlan(date, meal.time, e.target.value)}
                              placeholder={meal.placeholder}
                              className="min-h-[100px] text-xs resize-none border-0 focus-visible:ring-1 focus-visible:ring-wellness-primary"
                            />
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <QuickAddDialog date={date} time={meal.time} />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Card className="wellness-card-gradient wellness-shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <Button 

              className="flex items-center gap-2"
              onClick={saveWeeklyPlan}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Weekly Plan"}
            </Button>
            <Button variant="wellnessOutline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export as PDF
            </Button>
            <Button variant="wellnessOutline" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send to Patient
            </Button>
            <Button
              variant="outline"
              onClick={() => printTableWithHeaderFooter("diet-table")}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DietTableView;