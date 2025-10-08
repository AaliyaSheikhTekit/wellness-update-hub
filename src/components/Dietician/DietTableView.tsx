import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2
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

interface MealPlan {
  [date: string]: {
    [mealTime: string]: string;
  };
}

interface DietTableViewProps {
  patientId: number;
  patientName: string;
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
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mealPlans, setMealPlans] = useState<MealPlan>({});
  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ date: string; time: string } | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const updateMealPlan = (date: Date, mealTime: string, content: string) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealTime]: content
      }
    }));
  };

  const copyDayPlan = (date: Date) => {
    const dateKey = getDateKey(date);
    setCopiedDay(dateKey);
  };

  const pasteDayPlan = (targetDate: Date) => {
    if (!copiedDay) return;
    
    const targetKey = getDateKey(targetDate);
    setMealPlans(prev => ({
      ...prev,
      [targetKey]: { ...prev[copiedDay] }
    }));
  };

  const clearDayPlan = (date: Date) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => {
      const updated = { ...prev };
      delete updated[dateKey];
      return updated;
    });
  };

  const goToPreviousWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const QuickAddDialog = ({ date, time }: { date: Date; time: string }) => {
    const [open, setOpen] = useState(false);
    
    const addItem = (item: string) => {
      const dateKey = getDateKey(date);
      const currentContent = mealPlans[dateKey]?.[time] || "";
      const newContent = currentContent ? `${currentContent}, ${item}` : item;
      updateMealPlan(date, time, newContent);
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
              <div>
                <h4 className="font-semibold mb-2 text-sm">Medicated Waters</h4>
                <div className="grid grid-cols-3 gap-2">
                  {medicatedWaters.map((water) => (
                    <Button 
                      key={water.name} 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-xs h-auto py-2"
                      onClick={() => addItem(water.shortForm)}
                    >
                      {water.shortForm}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2 text-sm">Fruits</h4>
                <div className="grid grid-cols-4 gap-2">
                  {fruits.map((fruit) => (
                    <Button 
                      key={fruit} 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-xs h-auto py-1"
                      onClick={() => addItem(fruit)}
                    >
                      {fruit}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2 text-sm">Vegetables</h4>
                <div className="grid grid-cols-4 gap-2">
                  {vegetables.map((veg) => (
                    <Button 
                      key={veg} 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-xs h-auto py-1"
                      onClick={() => addItem(veg)}
                    >
                      {veg}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2 text-sm">Grains & Rotis</h4>
                <div className="grid grid-cols-3 gap-2">
                  {rotis.map((roti) => (
                    <Button 
                      key={roti} 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-xs h-auto py-1"
                      onClick={() => addItem(roti)}
                    >
                      {roti}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2 text-sm">Juices</h4>
                <div className="grid grid-cols-3 gap-2">
                  {juices.map((juice) => (
                    <Button 
                      key={juice.name} 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-xs h-auto py-2"
                      onClick={() => addItem(juice.shortForm)}
                    >
                      {juice.shortForm}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Week Navigation */}
      <Card className="wellness-card wellness-shadow-soft">
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
                      const content = mealPlans[dateKey]?.[meal.time] || "";
                      
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
            <Button variant="wellness" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Weekly Plan
            </Button>
            <Button variant="wellnessOutline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export as PDF
            </Button>
            <Button variant="wellnessOutline" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send to Patient
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              Print Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DietTableView;
