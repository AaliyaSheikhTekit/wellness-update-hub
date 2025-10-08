import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Calendar as CalendarIcon, Copy, Clipboard, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";

interface MealPlan {
  [date: string]: {
    [mealTime: string]: string[];
  };
}

interface DietCalendarViewProps {
  patientId: number;
  patientName: string;
}

const mealTimings = [
  "Early Morning (6:00 AM)",
  "Breakfast (8:00 AM)", 
  "Mid-Morning (10:00 AM)",
  "Lunch (12:00 PM)",
  "Evening Snack (4:00 PM)",
  "Dinner (7:00 PM)",
  "Before Sleep (9:00 PM)"
];

const DietCalendarView = ({ patientId, patientName }: DietCalendarViewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mealPlans, setMealPlans] = useState<MealPlan>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [copiedDay, setCopiedDay] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const addFoodToMeal = (date: Date, mealTime: string, food: string) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => {
      const currentMeals = prev[dateKey]?.[mealTime] || [];
      if (currentMeals.includes(food)) return prev;
      
      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: [...currentMeals, food]
        }
      };
    });
  };

  const removeFoodFromMeal = (date: Date, mealTime: string, foodIndex: number) => {
    const dateKey = getDateKey(date);
    setMealPlans(prev => {
      const currentMeals = prev[dateKey]?.[mealTime] || [];
      const updatedMeals = currentMeals.filter((_, index) => index !== foodIndex);
      
      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: updatedMeals
        }
      };
    });
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

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <Card className="wellness-card-gradient wellness-shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-wellness-primary">
              <CalendarIcon className="w-5 h-5" />
              Weekly Diet Plan - {patientName}
            </CardTitle>
            <div className="flex items-center gap-2">
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
          <p className="text-sm text-muted-foreground">
            Week of {format(currentWeekStart, "MMM d, yyyy")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </p>
          {copiedDay && (
            <Badge variant="secondary" className="w-fit">
              <Clipboard className="w-3 h-3 mr-1" />
              Copied: {format(new Date(copiedDay), "EEE, MMM d")}
            </Badge>
          )}
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, dayIndex) => {
          const dateKey = getDateKey(date);
          const isToday = isSameDay(date, new Date());
          const hasPlan = mealPlans[dateKey] && Object.keys(mealPlans[dateKey]).length > 0;

          return (
            <Card 
              key={dayIndex} 
              className={`wellness-card-gradient wellness-shadow-soft ${
                isToday ? 'ring-2 ring-wellness-primary' : ''
              }`}
            >
              <CardHeader className="p-3 pb-2">
                <div className="text-center">
                  <div className="font-semibold text-sm text-foreground">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-2xl font-bold text-wellness-primary">
                    {format(date, "d")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, "MMM")}
                  </div>
                </div>
                
                
                {/* Action Buttons */}
                <div className="flex gap-1 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => copyDayPlan(date)}
                    disabled={!hasPlan}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => pasteDayPlan(date)}
                    disabled={!copiedDay}
                  >
                    <Clipboard className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => clearDayPlan(date)}
                    disabled={!hasPlan}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-3 pt-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {mealTimings.map((mealTime) => (
                      <div key={mealTime} className="space-y-2">
                        <Label className="text-xs font-semibold text-foreground">
                          {mealTime.split(" ")[0]}
                        </Label>
                        
                        {/* Food Selection */}
                        <Select onValueChange={(value) => addFoodToMeal(date, mealTime, value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder={<Plus className="w-3 h-3" />} />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 font-semibold text-xs border-b">Medicated Waters</div>
                            {medicatedWaters.map((water) => (
                              <SelectItem key={water.name} value={water.name} className="text-xs">
                                {water.shortForm}
                              </SelectItem>
                            ))}
                            
                            <div className="p-2 font-semibold text-xs border-b mt-2">Fruits</div>
                            {fruits.slice(0, 10).map((fruit) => (
                              <SelectItem key={fruit} value={fruit} className="text-xs">{fruit}</SelectItem>
                            ))}
                            
                            <div className="p-2 font-semibold text-xs border-b mt-2">Vegetables</div>
                            {vegetables.slice(0, 10).map((veg) => (
                              <SelectItem key={veg} value={veg} className="text-xs">{veg}</SelectItem>
                            ))}
                            
                            <div className="p-2 font-semibold text-xs border-b mt-2">Grains</div>
                            {rotis.slice(0, 5).map((roti) => (
                              <SelectItem key={roti} value={roti} className="text-xs">{roti}</SelectItem>
                            ))}
                            
                            <div className="p-2 font-semibold text-xs border-b mt-2">Others</div>
                            {sprouts.slice(0, 5).map((sprout) => (
                              <SelectItem key={sprout} value={sprout} className="text-xs">{sprout}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Selected Foods */}
                        {mealPlans[dateKey]?.[mealTime] && mealPlans[dateKey][mealTime].length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mealPlans[dateKey][mealTime].map((food, index) => (
                              <Badge key={index} variant="secondary" className="text-xs py-0 px-1">
                                {food.length > 15 ? food.substring(0, 12) + "..." : food}
                                <button 
                                  className="ml-1 text-destructive hover:text-destructive/80"
                                  onClick={() => removeFoodFromMeal(date, mealTime, index)}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Save Actions */}
      <Card className="wellness-card-gradient wellness-shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Button variant="wellness" className="flex-1">
              Save Weekly Plan
            </Button>
            <Button variant="wellnessOutline">
              Export PDF
            </Button>
            <Button variant="wellnessOutline">
              Send to Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DietCalendarView;
