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
  getDietItems, 
  createWeeklyDietPlan, 
  getDietPlan 
} from "@/lib/api";

interface MealPlan {
  [date: string]: {
    [mealTime: string]: {
      text: string;
      itemIds: string[]; // Store diet item IDs
    };
  };
}

interface DietTableViewProps {
  patientId: string; // Changed from number to string for API
  patientName: string;
}

interface DietItem {
  id: string;
  name: string;
  category?: string;
  shortForm?: string;
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
  const [dietItems, setDietItems] = useState<DietItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  // Load diet items from API
  useEffect(() => {
    const loadDietItems = async () => {
      try {
        const response = await getDietItems();
        setDietItems(response.data || []);
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
        
        // Transform API response to local state format
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
      
      // Avoid duplicates
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
      // Transform local state to API format
      const planItems: { date: string; time: string; dietItemIds: string[] }[] = [];
      
      weekDays.forEach((date) => {
        const dateKey = getDateKey(date);
        const dayPlan = mealPlans[dateKey];
        
        if (dayPlan) {
          Object.entries(dayPlan).forEach(([time, meal]) => {
            if (meal.itemIds && meal.itemIds.length > 0) {
              // Convert date to ISO format with time
              const isoDate = new Date(date);
              const [hours, minutes] = time.split("-")[0].split(":")[0].split("M")[0].trim().split(":");
              const isPM = time.includes("PM");
              let hour = parseInt(hours);
              if (isPM && hour !== 12) hour += 12;
              if (!isPM && hour === 12) hour = 0;
              
              isoDate.setHours(hour, parseInt(minutes) || 0, 0, 0);
              
              planItems.push({
                date: isoDate.toISOString(),
                time: time,
                dietItemIds: meal.itemIds,
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

      await createWeeklyDietPlan(patientId, planItems);
      
      toast({
        title: "Success",
        description: "Weekly diet plan saved successfully!",
      });
    } catch (error) {
      console.error("Error saving diet plan:", error);
      toast({
        title: "Error",
        description: "Failed to save diet plan. Please try again.",
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
    
    const addItem = (itemId: string, itemName: string) => {
      addDietItemToMeal(date, time, itemId, itemName);
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Add Food Items</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Group diet items by category if available */}
              {["Medicated Waters", "Fruits", "Vegetables", "Grains", "Juices"].map((category) => {
                const items = dietItems.filter(item => 
                  item.category === category || 
                  (category === "Medicated Waters" && medicatedWaters.some(w => w.name === item.name))
                );
                
                if (items.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h4 className="font-semibold mb-2 text-sm">{category}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {items.map((item) => (
                        <Button 
                          key={item.id} 
                          variant="outline" 
                          size="sm"
                          className="justify-start text-xs h-auto py-2"
                          onClick={() => addItem(item.id, item.shortForm || item.name)}
                        >
                          {item.shortForm || item.name}
                        </Button>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
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
      {/* Header with Week Navigation */}
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

      {/* Diet Table */}
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

      {/* Action Buttons */}
      <Card className="wellness-card-gradient wellness-shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="wellness" 
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