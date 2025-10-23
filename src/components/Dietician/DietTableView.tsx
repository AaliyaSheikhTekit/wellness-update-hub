import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import IkshaLogo from "../../assets/iksha_logo.png";
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
  Printer,
  Minus,
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
import {
  getDiet,
  createWeeklyDietPlan,
  getDietPlan,
  getBackendToken,
} from "@/lib/api";

// NEW: shadcn Select for dropdowns in timing headers
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface MealPlan {
  [date: string]: {
    [mealTime: string]: {
      text: string;
      itemIds: string[];
      // removed per-cell restrictions from UI (now global)
      restrictions?: string;
    };
  };
}

interface DietTableViewProps {
  patientId: string;
  patientName: string;
  patientAge?: string | number;
  patientPhone?: string;
  patientCO?: string; // "C/O"
}

interface DietItem {
  id: string;
  name: string;
  subForm?: string;
  category?: { id: string; name: string };
  subCategory?: { id: string; name: string };
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

type MealTiming = { time: string; label: string; placeholder: string };

const DEFAULT_MEAL_TIMINGS: MealTiming[] = [
  { time: "04:30AM-05:00AM", label: "Early Morning", placeholder: "Pranayam" },
  { time: "07:30AM-08:00AM", label: "Yoga Time", placeholder: "Yoga" },
  { time: "08:00AM-09:00AM", label: "Breakfast", placeholder: "Breakfast" },
  { time: "11:00AM-01:00PM", label: "Mid-Morning", placeholder: "Snack" },
  { time: "01:30PM-02:30PM", label: "Lunch", placeholder: "Lunch" },
  { time: "05:00PM-06:00PM", label: "Evening", placeholder: "Concern" },
  { time: "07:30PM-08:30PM", label: "Dinner", placeholder: "Dinner" },
  { time: "08:30PM", label: "Before Sleep", placeholder: "Night" },
];

/** timing dropdown options (edit as you like) */
const COMMON_TIME_OPTIONS = [
  "04:30AM-05:00AM",
  "05:00AM-06:00AM",
  "06:00AM-07:00AM",
  "07:30AM-08:00AM",
  "08:00AM-09:00AM",
  "09:00AM-10:00AM",
  "11:00AM-01:00PM",
  "12:00PM-01:00PM",
  "01:30PM-02:30PM",
  "04:00PM-05:00PM",
  "05:00PM-06:00PM",
  "07:00PM-08:00PM",
  "07:30PM-08:30PM",
  "08:30PM",
];

const CATEGORY_RULES: Record<string, string[]> = {
  "Early Morning": ["Medicated Waters"],
  "Yoga Time": [],
  "Breakfast": [
    "Cooked Breakfast",
    "Sprouts",
    "Fruits",
    "Juices",
    "Quath & Teas",
    "Dry Fruits",
  ],
  "Mid-Morning": ["Fruits", "Juices", "Quath & Teas", "Dry Fruits", "Sprouts"],
  Lunch: ["Rotis", "Vegetables", "Pulses"],
  Evening: ["Quath & Teas", "Fruits", "Dry Fruits", "Juices"],
  Dinner: ["Rotis", "Vegetables", "Pulses", "Soups"],
  "Before Sleep": ["Quath & Teas", "Medicated Waters"],
};

const DietTableView = ({
  patientId,
  patientName,
  patientAge,
  patientPhone,
  patientCO,
}: DietTableViewProps) => {
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [mealPlans, setMealPlans] = useState<MealPlan>({});
  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [dietItems, setDietItems] = useState<DietCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // timings state
  const [mealTimingsState, setMealTimingsState] =
    useState<MealTiming[]>(DEFAULT_MEAL_TIMINGS);

  // NEW: one common restrictions/notes field for the whole week
  const [commonRestrictions, setCommonRestrictions] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );
  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const dietItemMap = useMemo(() => {
    const map: Record<string, string> = {};
    dietItems.forEach((cat) => {
      cat.subCategories.forEach((sub) => {
        sub.items.forEach((item) => {
          map[item.id] = item.subForm || item.name || "";
        });
      });
    });
    return map;
  }, [dietItems]);

  const getDisplayForIds = (ids: string[]) =>
    ids
      .map((id) => dietItemMap[id] || "")
      .filter(Boolean)
      .join(", ");

  const isAllowedForTiming = (timingLabel: string, categoryName: string) => {
    const allowed = CATEGORY_RULES[timingLabel] ?? [];
    if (allowed.length === 0) return false;
    return allowed.some((a) => a.toLowerCase() === categoryName.toLowerCase());
  };

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
            if (!transformed[dateKey]) transformed[dateKey] = {};
            if (plan.dietPlanItem) {
              const ids: string[] = plan.dietPlanItem.dietItem.map(
                (item: any) => item.id
              );
              const text = plan.dietPlanItem.dietItem
                .map((item: any) => item.name || item.shortForm)
                .join(", ");
              transformed[dateKey][plan.dietPlanItem.time] = {
                text,
                itemIds: ids,
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

  const updateMealPlanText = (
    date: Date,
    mealTime: string,
    content: string
  ) => {
    const dateKey = getDateKey(date);
    setMealPlans((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealTime]: {
          text: content,
          itemIds: prev[dateKey]?.[mealTime]?.itemIds || [],
        },
      },
    }));
  };

  const addDietItemToMeal = (date: Date, mealTime: string, itemId: string) => {
    const dateKey = getDateKey(date);
    setMealPlans((prev) => {
      const current = prev[dateKey]?.[mealTime];
      const ids = current?.itemIds || [];
      if (ids.includes(itemId)) return prev;

      const newIds = [...ids, itemId];
      const newText = getDisplayForIds(newIds);

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: {
            text: newText,
            itemIds: newIds,
          },
        },
      };
    });
  };

  const removeDietItemFromMeal = (
    date: Date,
    mealTime: string,
    itemId: string
  ) => {
    const dateKey = getDateKey(date);
    setMealPlans((prev) => {
      const current = prev[dateKey]?.[mealTime];
      if (!current) return prev;
      const newIds = current.itemIds.filter((id) => id !== itemId);
      const newText = getDisplayForIds(newIds);
      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: {
            text: newText,
            itemIds: newIds,
          },
        },
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
    setMealPlans((prev) => ({
      ...prev,
      [targetKey]: { ...(prev[copiedDay] || {}) },
    }));
    toast({
      title: "Pasted",
      description: `Diet plan pasted to ${format(targetDate, "MMM d")}`,
    });
  };

  const clearDayPlan = (date: Date) => {
    const dateKey = getDateKey(date);
    setMealPlans((prev) => {
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
      const weeklyPlan = weekDays.flatMap((date) => {
        const dateKey = getDateKey(date);
        const dayPlan = mealPlans[dateKey];
        if (!dayPlan) return [];

        return Object.entries(dayPlan)
          .filter(([_, meal]) => meal.itemIds && meal.itemIds.length > 0)
          .map(([time, meal]) => ({
            date: new Date(date).toISOString(),
            time,
            dietItemIds: meal.itemIds,
          }));
      });

      if (weeklyPlan.length === 0) {
        toast({
          title: "No Changes",
          description: "No diet items to save",
          variant: "destructive",
        });
        return;
      }

      await createWeeklyDietPlan(patientId, weeklyPlan);

      toast({
        title: "Success",
        description: `Successfully saved ${weeklyPlan.length} diet plan entries!`,
      });
    } catch (error) {
      console.error("Error saving diet plan:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save diet plan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToPreviousWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const goToToday = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  /** when timing time string changes, migrate keys in mealPlans */
  const renameMealTimeKey = (oldTime: string, newTime: string) => {
    if (oldTime === newTime) return;
    setMealPlans((prev) => {
      const cloned: MealPlan = { ...prev };
      Object.keys(cloned).forEach((dateKey) => {
        const day = cloned[dateKey];
        if (!day || !day[oldTime]) return;
        const existing = day[newTime];
        day[newTime] = existing
          ? {
              text: [existing.text, day[oldTime].text]
                .filter(Boolean)
                .join(", "),
              itemIds: Array.from(
                new Set([
                  ...(existing.itemIds || []),
                  ...(day[oldTime].itemIds || []),
                ])
              ),
            }
          : day[oldTime];
        delete day[oldTime];
      });
      return cloned;
    });
  };

  /** QuickAddDialog stays the same (unchanged) */
  const QuickAddDialog = ({
    date,
    time,
    timeLabel,
  }: {
    date: Date;
    time: string;
    timeLabel: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const allItems: (DietItem & {
      categoryName: string;
      subCategoryName: string;
    })[] = useMemo(() => {
      const arr: (DietItem & {
        categoryName: string;
        subCategoryName: string;
      })[] = [];
      dietItems.forEach((category) => {
        category.subCategories.forEach((subCategory) => {
          subCategory.items.forEach((item) => {
            arr.push({
              ...item,
              categoryName: category.name,
              subCategoryName: subCategory.name,
            });
          });
        });
      });
      return arr;
    }, [dietItems]);

    const gated = useMemo(
      () => allItems.filter((i) => isAllowedForTiming(timeLabel, i.categoryName)),
      [allItems, timeLabel]
    );

    const filtered = useMemo(() => {
      const q = searchQuery.toLowerCase();
      return gated.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.subForm?.toLowerCase().includes(q) ?? false) ||
          item.categoryName.toLowerCase().includes(q) ||
          item.subCategoryName.toLowerCase().includes(q)
      );
    }, [gated, searchQuery]);

    const toggleItem = (itemId: string) => {
      setSelectedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    };

    const addSelectedItems = () => {
      selectedItems.forEach((itemId) => addDietItemToMeal(date, time, itemId));
      setSelectedItems([]);
      setSearchQuery("");
      setOpen(false);
    };

    const grouped: Record<string, Record<string, typeof gated>> = useMemo(() => {
      const base: Record<string, Record<string, typeof gated>> = {};
      (searchQuery ? filtered : gated).forEach((item) => {
        base[item.categoryName] ??= {};
        base[item.categoryName][item.subCategoryName] ??= [];
        base[item.categoryName][item.subCategoryName].push(item);
      });
      return base;
    }, [gated, filtered, searchQuery]);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Add items">
            <Plus className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              Add Items • {format(date, "MMM d")} • {timeLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Search by item / short form / category / subcategory…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-md">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} selected
                </span>
                <Button size="sm" onClick={addSelectedItems}>
                  Add Selected
                </Button>
              </div>
            )}

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(grouped).map(([cat, subs]) => (
                  <div key={cat} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-bold text-base text-gray-800 mb-4">
                      📂 {cat}
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(subs).map(([subName, items]) => (
                        <div key={subName} className="ml-2">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">
                            {subName}{" "}
                            <span className="text-xs text-gray-500 font-normal">
                              ({items.length} items)
                            </span>
                          </h4>

                          <div className="grid grid-cols-2 gap-2 ml-4">
                            {items.map((item) => {
                              const checked = selectedItems.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => toggleItem(item.id)}
                                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                    checked
                                      ? "bg-blue-50 border-blue-400 shadow-sm"
                                      : "bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleItem(item.id)}
                                    className="w-4 h-4 mt-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {item.name}
                                    </div>
                                    {item.subForm && (
                                      <div className="text-xs text-blue-600 font-medium mt-1">
                                        {item.subForm}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(grouped).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="font-medium">
                      No diet items for this time slot
                    </div>
                    <div className="text-sm mt-1">
                      Try a different slot or adjust rules
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedItems([]);
                setSearchQuery("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={addSelectedItems} disabled={selectedItems.length === 0}>
              Add {selectedItems.length > 0 && `(${selectedItems.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  /** Print: includes the new commonRestrictions box */
const printTableWithHeaderFooter = (tableId: string) => {
  const weekRows: {
    sn: number;
    date: string;
    slot: string;
    items: string;
  }[] = [];
  let sn = 1;
  weekDays.forEach((date) => {
    const dateKey = getDateKey(date);
    const dayPlan = mealPlans[dateKey] || {};
    mealTimingsState.forEach((mt) => {
      const cell = dayPlan[mt.time];

      // OPTIONAL: if you implemented per-cell print overrides:
      // const printable = (cell?.printText?.trim() || cell?.text?.trim() || "");
      const printable = (cell?.text?.trim() || "");

      if (cell && (cell.itemIds?.length > 0 || printable.length > 0)) {
        weekRows.push({
          sn: sn++,
          date: format(date, "dd/MM/yyyy"),
          slot: `${mt.label} (${mt.time})`,
          items: printable,
        });
      }
    });
  });

  const newWindow = window.open("", "_blank", "width=1000,height=800");
  if (!newWindow) return;

  const headerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-center; border-bottom:4px solid #F59E0B; padding-bottom:10px; margin-bottom:10px;">
      <div>
        <img src="${IkshaLogo}" alt="Iksha Logo" style="height: 80px;" />
      
      </div>
   
    </div>
    <div style="font-size:12px; margin: 10px 0 4px;">
      <div><strong>Patient:</strong> ${patientName || ""}</div>
      ${patientAge !== undefined ? `<div><strong>Age:</strong> ${patientAge}</div>` : ""}
      ${patientPhone ? `<div><strong>Phone:</strong> ${patientPhone}</div>` : ""}
      ${patientCO ? `<div><strong>C/O:</strong> ${patientCO}</div>` : ""}
      <div><strong>Week:</strong> ${format(currentWeekStart, "dd/MM/yyyy")} - ${format(addDays(currentWeekStart, 6), "dd/MM/yyyy")}</div>
    </div>
  `;

  const rowsHTML = weekRows.map(r => `
    <tr>
      <td>${r.sn}</td>
      <td>${r.date}</td>
      <td>${r.slot}</td>
      <td>${r.items || "-"}</td>
    </tr>
  `).join("");

  // ---------- NEW: Diet Instructions & Recipes (HTML) ----------
  const dietInstructionsHTML = `
    <div class="diet-section">
      <h2>Any Specific Diet Instruction</h2>

      <h3>Vegetables</h3>
      <p>Loki, Tinda, Torai, Parval, Gajar, Gilki, Karela, Phool Gobhi, Patta Gobhi, Broccoli, Palak, Methi, Sahjan, Aloo, Tamatar, Pyaz, Pumpkin, Petha, Baingan, Shimla Mirch.</p>

      <h3>Dal</h3>
      <p>Moong, Tuar, Moth, Channa, Masoor, Mixed</p>

      <h3>Atta (Flour)</h3>
      <p>Wheat, Jau, Jowar, Ragi+Bajra, Kuttu, Multi grain</p>

      <h3>Medicated Water</h3>
      <p>(See recipes below)</p>

      <h3>Oil for cooking</h3>
      <p>Mustard, Coconut, Sesame (Til), Groundnut (Moongfali), Olive, Desi Ghee, Sunflower, Rice bran. <strong>Note:</strong> Oils should be cold pressed; try to avoid refined oils.</p>

      <h3>Fasting Once A Week</h3>
      <p>Mono diet / Fruit / Juice / Water / Other …</p>

      <h3>Restrictions</h3>
      <p>Tea, sugar, coffee, fried oily foods, too much spicy food, egg, meat, refined flour, biscuits, bread, soft drinks, cola, pizza, burgers, fast food, junk food, canned foods, confectionery, synthetic foods, refined foods, alcohol, tobacco, pan-masala, intoxicating drugs, jam, jelly and other artificial/chemical mixed foods.</p>

      <h2>🌿 Healthy Habits for Optimal Well-being</h2>
      <ul>
        <li>A proper balance of diet, exercise, rest, mental attitude, and connection with nature is essential for optimal health.</li>
        <li>Prefer a diet that includes 80% alkaline (raw) and 20% acidic (cooked) foods.</li>
        <li>Wash vegetables thoroughly before use.</li>
        <li>Cook lightly or steam; use minimal oil and spices.</li>
        <li>Prefer low-AGE cooking methods (steaming or boiling).</li>
        <li>Eat local and seasonal foods.</li>
        <li>If you drink tea every day, avoid eating anything with it; have other foods 1 hour before or after tea (restrict tea to 1 cup/day).</li>
        <li>Do not have milk products with any fruits or vegetables.</li>
        <li>A plant-rich diet keeps the body balanced and reduces inflammation.</li>
        <li>Avoid overeating; chew food well and eat slowly.</li>
        <li>Dinner should be light and eaten 2–3 hours before bedtime.</li>
        <li>Sit in Vajrasana 5–10 minutes or lie on your left side after meals to improve digestion.</li>
        <li>Sleep by 9–10 PM and wake up before sunrise.</li>
        <li>Eat peacefully, with joy and awareness.</li>
        <li>Drink 2.5–3 liters of water per day.</li>
        <li>Avoid drinking water immediately before or after meals.</li>
        <li>Get at least 20 minutes of sunlight daily; enjoy fresh air, walk barefoot, and spend time gardening.</li>
        <li>Keep your thoughts positive and full of gratitude.</li>
        <li><em>“What nature cannot cure, no one can.”</em></li>
      </ul>
      <p><strong>Mantra:</strong> Eat natural. Think positive. Sleep early. Stay active. Connect with nature. Health is the harmony of body, mind, and nature.</p>

      <h2>Naturopathy Recipes Guide</h2>

      <h3>Medicated Water</h3>
      <ul>
        <li><strong>Lemon Honey Water (LHW):</strong> 1 glass lukewarm water + ½ lemon juice + 1.5 tsp honey.</li>
        <li><strong>Lemon Methi Water (LMW):</strong> Soak 1 tsp fenugreek overnight in 1 glass lukewarm water; strain, add lemon.</li>
        <li><strong>Sauf Water (SW):</strong> Soak 2 tsp fennel overnight in 1 glass water; blend with the water; add 5 g mishri.</li>
        <li><strong>Methi Water (MW):</strong> Boil 1 tsp fenugreek in 200 ml water; strain; drink warm.</li>
        <li><strong>Methi Honey Water (MHW):</strong> Boil 1 tsp fenugreek in 200 ml water; strain; add 5–10 ml honey when lukewarm.</li>
        <li><strong>Panchamrit:</strong> Soak 4 g each ajwain, cumin, fennel, coriander in 1 L water overnight; soak fenugreek separately. Strain and drink.</li>
        <li><strong>Pittahar:</strong> Soak 4 g cumin, 4 g big fennel, 4 g coriander, 4 g licorice, 4 g rose petals (or rose water) in 1 L water overnight. Strain and drink; re-soak, grind, and use again after 5–6 hrs.</li>
        <li><strong>Other Medicated Water (Common for all):</strong> Soak 1 spoon powder/ingredient in 1 glass water overnight. Strain and drink warm.</li>
      </ul>

      <h3>Kwath (Kadha)</h3>
      <p>Boil 1 tsp kwath powder in 300 ml water till 100 ml remains. Strain and drink.</p>

      <h3>Antigastric Powder</h3>
      <p>Lightly roast fennel (10 g), cumin (10 g), coriander (10 g), fenugreek (5 g), carom (5 g). Grind to powder. Add a pinch of black salt, hing, and Eno/baking soda to taste. Store airtight. Take 1 tsp with warm water before meals or as needed.</p>

      <h3>Sprouts</h3>
      <p>Moong, moth, channa, wheat, methi, masoor: soak overnight; tie in muslin in the morning; in 12–24 hrs (winter ~24 hrs) when sprouted, refrigerate.</p>

      <h3>Sweet Dishes</h3>
      <ul>
        <li><strong>Carrot Sweet Dish:</strong> Grate ½ kg carrots & bottle gourd; dry roast to evaporate water. Add honey (50 g), cardamom (10 g), raisins (50 g), coconut powder (50 g), almonds (25 g). Make laddus; coat with coconut.</li>
        <li><strong>Banana Sweet Dish:</strong> Slice banana rings; roast sesame (30 g) & peanuts (50 g), powder; add honey (25 g) & coconut (25 g); stuff and coat banana pieces.</li>
        <li><strong>Date Laddus:</strong> Deseed & crush dates (50 g); roast sesame (10 g) & peanuts (10 g), powder; add cardamom (5 g); mix & shape; coat with fresh coconut.</li>
        <li><strong>Til Laddus:</strong> Roast sesame (25 g) & ajwain (10 g); mix with jaggery (20 g) & cardamom (10 g); blend, shape, and serve warm.</li>
      </ul>

      <h3>Soups</h3>
      <ul>
        <li><strong>Spinach Soup:</strong> Boil spinach (400 g), ginger (25 g), 1 potato; blend; add 1.5 L water, strain, heat. Separately roast soy flour (100 g) with cloves (5) & bay leaves (2); add to soup; salt to taste.</li>
        <li><strong>Tomato Soup:</strong> Tomato (200 g), ginger (10 g), cinnamon (1), green cardamom (2), soy flour (5 g); same method as spinach; rock & black salt to taste.</li>
        <li><strong>Tomato Soup (Alt):</strong> For 4: boil tomato (200 g), ginger (10 g), ½ potato (peeled), 1 onion, 2 black pepper, cinnamon (5 g), 1 black cardamom, 2 cloves, 1 bay leaf in 250 ml water; blend & strain; reheat; season (rock/black salt, roasted cumin) and garnish (grated carrot, cucumber, coriander).</li>
        <li><strong>Moong Dal Soup:</strong> Boil moong dal (200 g) in 1.5 L water; add chopped carrots (3), cabbage (100 g), tomato (100 g), cucumber (100 g); season (cumin 15 g, salt, lemon); add ginger & coriander.</li>
        <li><strong>Cabbage Soup:</strong> Cabbage (400 g), ginger (25 g), 1 onion, 1 small & 2 big cardamoms, black pepper, rock salt — method like spinach soup.</li>
        <li><strong>Raw Papaya Soup:</strong> Raw papaya (400 g), ginger (25 g), 1 onion, soy flour (15 g), 2 cinnamon sticks, 5 cloves, milk (100 g); method like spinach soup, add boiled milk at end; season with rock/black salt & pepper.</li>
      </ul>

      <h3>Vegetable Dishes</h3>
      <ul>
        <li><strong>Boiled Vegetables:</strong> Wash in lukewarm salted water; cut; in pan/cooker add ~1 g ghee/oil (for 4), sauté cumin & hing; add veggies, turmeric, salt; cook low flame; garnish with tomato, coriander powder & leaves.</li>
        <li><strong>Bottle Gourd & Spinach Kofta:</strong> Grate bottle gourd; steam; mix with green chili, ginger, coriander, fennel, cumin, turmeric, besan, wheat flour, salt; shape balls; steam/bake; add to tomato gravy. Same for spinach kofta.</li>
        <li><strong>Stuffed Bitter Gourd:</strong> Peel/deseed; parboil; temper hing & cumin in ghee; add soaked moong dal, peanut & sesame powder, spices, coconut; stuff; pan-fry with little ghee/oil; garnish. For sweetness: soaked figs/dates/raisins or jaggery.</li>
        <li><strong>Momos:</strong> Soak cabbage leaves in hot water 10 min. Boil & mash raw banana (1 kg) + potato (250 g). Grate carrot (250 g), beetroot (250 g), bottle gourd; sauté with ghee (20 g), cumin (2 g), hing (3 g), turmeric, salt, pepper, roasted cumin, lemon, raisins; wrap in cabbage leaves; steam or pan-roast with little ghee/oil; serve with chutney.</li>
      </ul>

      <h3>Vegan Smoothie</h3>
      <p>Blend 1 banana + ½ cup seasonal fruit (mango/papaya/apple/berries) + 1 cup almond/coconut/soy/oat milk + 2 soaked dates + 1 tsp chia + ½ tsp flaxseed powder + pinch cinnamon. Top with nuts/seeds; serve immediately.</p>
    </div>
  `;

  newWindow.document.write(`
    <html>
      <head>
        <title>Weekly Diet Plan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 16px 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
          th { background: #f7f7f7; }
          .footer { font-size: 10px; color: #555; margin-top: 12px; text-align:center; }
          .common-box { margin-top: 12px; padding: 8px; border: 1px dashed #aaa; font-size: 12px; white-space: pre-wrap; }
          .diet-section { margin-top: 16px; font-size: 12px; line-height: 1.5; }
          .diet-section h2 { margin: 18px 0 8px; font-size: 15px; }
          .diet-section h3 { margin: 12px 0 6px; font-size: 13px; }
          .diet-section ul { margin: 6px 0 8px 18px; padding: 0; }
          .diet-section li { margin: 4px 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${headerHTML}
        <table>
          <thead>
            <tr>
              <th style="width:50px;">S.N.</th>
              <th style="width:90px;">Date</th>
              <th style="width:220px;">Time Slot</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML || `<tr><td colspan="4" style="text-align:center; color:#777;">No entries this week</td></tr>`}
          </tbody>
        </table>

        <div class="common-box">
          <strong>Common Restrictions / Notes:</strong>
          <div>${(commonRestrictions || "-")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\\n/g, "<br/>")}</div>
        </div>

        ${dietInstructionsHTML}

        <div class="footer">
          <p>Integrated Natural Healing system for a comprehensive</p>
          <p>📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
          <p>© ${new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
        </div>
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // distinct labels list for the dropdown
  const LABEL_OPTIONS = Array.from(
    new Set(DEFAULT_MEAL_TIMINGS.map((m) => m.label))
  );

  return (
    <div className="space-y-4">
      <Card id="diet-table" className="wellness-card wellness-shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-wellness-primary mb-1">
                <CalendarIcon className="w-5 h-5" />
                Weekly Diet Plan - {patientName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Week: {format(currentWeekStart, "MMM d")} -{" "}
                {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
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
              <Button size="sm" onClick={goToToday}>
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
                {mealTimingsState.map((mt, idx) => (
                  <th
                    key={idx}
                    className="border border-wellness-muted p-2 text-center font-semibold text-xs min-w-[220px]"
                  >
                    {/* DROPDOWNS for timing label and time */}
                    <div className="flex flex-col items-stretch gap-2">
                      <Select
                        value={mt.label}
                        onValueChange={(val) => {
                          const next = [...mealTimingsState];
                          next[idx] = { ...mt, label: val };
                          setMealTimingsState(next);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          {LABEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={mt.time}
                        onValueChange={(val) => {
                          const oldTime = mt.time;
                          const next = [...mealTimingsState];
                          next[idx] = { ...mt, time: val };
                          setMealTimingsState(next);
                          if (oldTime !== val) renameMealTimeKey(oldTime, val);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_TIME_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {weekDays.map((date, dateIdx) => {
                const dateKey = getDateKey(date);
                const isToday =
                  format(date, "yyyy-MM-dd") ===
                  format(new Date(), "yyyy-MM-dd");

                return (
                  <tr
                    key={dateIdx}
                    className={`hover:bg-wellness-soft/30 transition-colors ${
                      isToday ? "bg-wellness-soft/50" : ""
                    }`}
                  >
                    <td className="border border-wellness-muted p-2 sticky left-0 bg-white dark:bg-card z-10">
                      <div className="flex flex-col gap-1">
                        <div
                          className={`font-semibold text-sm ${
                            isToday ? "text-wellness-primary" : ""
                          }`}
                        >
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

                    {mealTimingsState.map((mt, mealIdx) => {
                      const cell = mealPlans[dateKey]?.[mt.time];
                      const ids = cell?.itemIds || [];

                      return (
                        <td
                          key={mealIdx}
                          className="border border-wellness-muted p-2 align-top"
                        >
                          {/* selected items as removable chips */}
                          <div className="flex flex-wrap gap-1 mb-2 min-h-[28px]">
                            {ids.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                No items
                              </span>
                            )}
                            {ids.map((id) => (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded"
                              >
                                <span className="text-xs font-medium">
                                  {dietItemMap[id] || id}
                                </span>
                                <button
                                  type="button"
                                  className="ml-1 p-0.5 hover:bg-blue-100 rounded"
                                  title="Remove item"
                                  onClick={() =>
                                    removeDietItemFromMeal(date, mt.time, id)
                                  }
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* free text for the cell (items override/notes specific to slot) */}
                          <Textarea
                            value={cell?.text || ""}
                            onChange={(e) =>
                              updateMealPlanText(date, mt.time, e.target.value)
                            }
                            placeholder={mt.placeholder}
                            className="min-h-[64px] text-xs resize-none border focus-visible:ring-1 focus-visible:ring-wellness-primary"
                          />

                          {/* QUICK ADD, gated by timing label */}
                          {CATEGORY_RULES[mt.label]?.length ? (
                            <div className="flex justify-end mt-1">
                              <QuickAddDialog
                                date={date}
                                time={mt.time}
                                timeLabel={mt.label}
                              />
                            </div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground mt-2 text-right">
                              No items allowed for {mt.label}
                            </div>
                          )}
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

      {/* NEW: Common restrictions/notes under the table */}
      <Card className="wellness-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Common Restrictions / Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={commonRestrictions}
            onChange={(e) => setCommonRestrictions(e.target.value)}
            placeholder="e.g., Avoid sugar, no fried items, hydrate well, ...
(Shown on printout and applies to the entire week)"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

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

            <Button
              variant="wellnessOutline"
              className="flex items-center gap-2"
              onClick={() => window.print()}
            >
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
