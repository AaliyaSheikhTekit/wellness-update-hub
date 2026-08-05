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
import { getDiet, createDietPlan, getAllYoga } from "@/lib/api";

// NEW: shadcn Select for dropdowns in timing headers
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "../ui/checkbox";
import { fruits } from "@/data/dietData";

interface MealPlan {
  [date: string]: {
    [mealTime: string]: {
      text: string;
      itemIds: string[];
      itemQty?: Record<string, string>;
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
  latestAppointmentId?: string;
  consultationId?: string;
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

// ---- REPLACE YOUR EXISTING CATEGORY_RULES + isAllowedForTiming WITH THIS ----

const CATEGORY_RULES: Record<string, string[]> = {
  "Early Morning": ["Medicated Waters", "Quath & Teas", "Juices"],
  "Yoga Time": ["Yoga"],
  Breakfast: [
    "Cooked Breakfast",
    "Sprouts",
    "Fruits",
    "Juices",
    "Quath & Teas",
    "Dry Fruits",
    "Salad",
  ],
  "Mid-Morning": [
    "Fruits",
    "Juices",
    "Quath & Teas",
    "Dry Fruits",
    "Sprouts",
    "Medicated Waters",
  ],
  Lunch: [
    "Rotis",
    "Rice",
    "Vegetable",
    "Pulses and Legumes",
    "Dal",
    "Curd",
    "Buttermilk",
    "Paneer",
    "Soups",
    "Seeds and Powder",
    "Salad",
  ],
  Evening: [
    "Fruits",
    "Dry Fruits",
    "Juices",
    "Quath & Teas",
    "Soups",
    "Medicated Waters",
    "Snacks & Other",
  ],
  Dinner: [
    "Rotis",
    "Rice",
    "Vegetable",
    "Pulses and Legumes",
    "Dal",
    "Soups",
    "Curd",
    "Paneer",
    "Buttermilk",
    "Seeds and Powder",
    "Salad",
  ],
  "Before Sleep": ["Quath & Teas", "Medicated Waters"],
};

// 🔧 FIXED FUNCTION — case-insensitive + space-safe match
const isAllowedForTiming = (timingLabel: string, categoryName: string) => {
  const allowed = CATEGORY_RULES[timingLabel] ?? [];
  if (allowed.length === 0) return false;
  return allowed.some(
    (a) => a.trim().toLowerCase() === (categoryName || "").trim().toLowerCase()
  );
};

const DietTableView = ({
  patientId,
  patientName,
  latestAppointmentId: appointmentId,
  consultationId,
}: DietTableViewProps) => {
  console.log(
    "DietTableView rendered with appointmentId:",
    appointmentId,
    consultationId
  );
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [mealPlans, setMealPlans] = useState<MealPlan>({});
  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [dietItems, setDietItems] = useState<DietCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [yogaCategories, setYogaCategories] = useState<any[]>([]);
  // timings state
  const [mealTimingsState, setMealTimingsState] =
    useState<MealTiming[]>(DEFAULT_MEAL_TIMINGS);
const [dietDuration, setDietDuration] = useState(1);
  // NEW: one common restrictions/notes field for the whole week
  const [commonRestrictions, setCommonRestrictions] = useState("");

const weekDays = Array.from(
  { length: dietDuration },
  (_, i) => addDays(currentWeekStart, i)
);
  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

const dietItemMap = useMemo(() => {
    const map: Record<string, { label: string; category: string }> = {};

    dietItems.forEach((cat) => {
      cat.subCategories.forEach((sub) => {
        sub.items.forEach((item) => {
          map[item.id] = {
            label: item.subForm || item.name || "",
            category: cat.name,
          };
        });
      });
    });

    yogaCategories.forEach((cat: any) => {
      cat.subCategories?.forEach((sub: any) => {
        sub.items?.forEach((item: any) => {
          map[item.id] = {
            label: item.name || "",
            category: "Yoga",
          };
        });
      });
    });

    return map;
  }, [dietItems, yogaCategories]);
const getDisplayForIds = (
    ids: string[],
    plain = false,
    qtyMap: Record<string, string> = {}
  ) => {
    const order: string[] = [];
    const groups: Record<string, string[]> = {};

    ids.forEach((id) => {
      const entry = dietItemMap[id];
      if (!entry) return;
      const qty = qtyMap[id];
      const label = qty ? `${qty} ${entry.label}` : entry.label;
      if (!groups[entry.category]) {
        groups[entry.category] = [];
        order.push(entry.category);
      }
      groups[entry.category].push(label);
    });

    return order
      .map((cat) =>
        plain ? `(${groups[cat].join(" / ")})` : `${cat}: (${groups[cat].join(" / ")})`
      )
      .join(" + ");
  };
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
const addDietItemToMeal = (
    date: Date,
    mealTime: string,
    itemId: string,
    qty?: string
  ) => {
    const dateKey = getDateKey(date);
    setMealPlans((prev) => {
      const current = prev[dateKey]?.[mealTime];
      const ids = current?.itemIds || [];
      if (ids.includes(itemId)) return prev;

      const newIds = [...ids, itemId];
      const newQtyMap = { ...(current?.itemQty || {}) };
      if (qty) newQtyMap[itemId] = qty;

      const timing = mealTimingsState.find((m) => m.time === mealTime);
      const isPlain = timing?.label === "Lunch" || timing?.label === "Dinner";
      const newText = getDisplayForIds(newIds, isPlain, newQtyMap);

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: {
            text: newText,
            itemIds: newIds,
            itemQty: newQtyMap,
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
      const newQtyMap = { ...(current.itemQty || {}) };
      delete newQtyMap[itemId];

      const timing = mealTimingsState.find((m) => m.time === mealTime);
      const isPlain = timing?.label === "Lunch" || timing?.label === "Dinner";
      const newText = getDisplayForIds(newIds, isPlain, newQtyMap);

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [mealTime]: {
            text: newText,
            itemIds: newIds,
            itemQty: newQtyMap,
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
      // Group meals by date
      const groupedByDate = weekDays
        .map((date) => {
          const dateKey = getDateKey(date);
          const dayPlan = mealPlans[dateKey];
          if (!dayPlan) return null;

          const dietPlanItems = Object.entries(dayPlan)
            .filter(([_, meal]) => (meal.itemIds && meal.itemIds.length > 0) || (meal.text && meal.text.trim() !== ""))
            .map(([time, meal]) => {
              // Separate yoga items vs diet items
              const yogaItemIds: string[] = [];
              const dietItemIds: string[] = [];

              if (meal.itemIds) {
                meal.itemIds.forEach((id) => {
                  // ✅ Yoga items come from yogaCategories
                  const isYoga = yogaCategories.some((cat: any) =>
                    cat.subCategories?.some((sub: any) =>
                      sub.items?.some((item: any) => item.id === id)
                    )
                  );
                  if (isYoga) yogaItemIds.push(id);
                  else dietItemIds.push(id);
                });
              }

              return {
                time,
                text: meal.text || "",
                dietItem: dietItemIds,
                yogaItem: yogaItemIds,
              };
            })
            .filter(
              (item) => item.dietItem.length > 0 || item.yogaItem.length > 0 || (item.text && item.text.trim() !== "")
            );

          if (dietPlanItems.length === 0) return null;

          return {
            date: new Date(date).toISOString(),
            dietPlanItems,
          };
        })
        .filter(Boolean);

      if (groupedByDate.length === 0) {
        toast({
          title: "No Changes",
          description: "No diet or yoga items to save",
          variant: "destructive",
        });
        return;
      }

     if (!appointmentId || !patientId) {
  toast({
    title: "Missing Info",
    description: "Patient or appointment ID is missing.",
    variant: "destructive",
  });
  return;
}

 const payload = {
  appointmentId: String(appointmentId),
  consultationId: consultationId || undefined,
  patientId,
  restrictions: commonRestrictions,
  duration: dietDuration,
  vegetables: selectedVeg.join(", "),
  fruits: selectedFruits.join(", "),
  dal: selectedDal.join(", "),
  atta: selectedAtta.join(", "),
  weekPlan: groupedByDate,
};


   await createDietPlan(
  patientId,
  String(appointmentId),
  consultationId || "",
  groupedByDate,
  commonRestrictions,
  selectedVeg.join(", "),
  selectedFruits.join(", "),
  selectedDal.join(", "),
  selectedAtta.join(", "),
  dietDuration
);
      toast({
        title: "Success",
        description: `Successfully saved weekly diet & yoga plan (${groupedByDate.length} days)!`,
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

  const goToPreviousWeek = () =>
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
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

  useEffect(() => {
    const fetched = { current: false }; // mutable reference without useRef

    const fetchYoga = async () => {
      if (fetched.current) return;
      fetched.current = true;

      try {
        const res = await getAllYoga();
        if (res?.data) {
          console.log("✅ Yoga data loaded:", res.data);
          setYogaCategories(res.data || res.data || []);
        } else {
          console.warn("⚠️ No yoga data returned");
        }
      } catch (err) {
        console.error("Error fetching yoga data:", err);
      }
    };

    fetchYoga();
  }, []);

  // ✅ Checkbox data
  const vegOptions = [
    "Loki",
    "Tinda",
    "Torai",
    "Parval",
    "Gajar",
    "Gilki",
    "Karela",
    "Phool Gobhi",
    "Patta Gobhi",
    "Broccoli",
    "Palak",
    "Methi",
    "Sahjan",
    "Aloo",
    "Tamatar",
    "Pyaz",
    "Pumpkin",
    "Petha",
    "Baingan",
    "Shimla Mirch",
  ];
  const dalOptions = ["Moong", "Tuar", "Moth", "Channa", "Masoor", "Mixed"];
  const attaOptions = [
    "Wheat",
    "Jau",
    "Jowar",
    "Ragi+Bajra",
    "Kuttu",
    "Multi grain",
  ];

  const [selectedVeg, setSelectedVeg] = useState(vegOptions);
  const [selectedFruits, setSelectedFruits] = useState(fruits);
  const [selectedDal, setSelectedDal] = useState(dalOptions);
  const [selectedAtta, setSelectedAtta] = useState(attaOptions);

  const toggleCheckbox = (value: string, list: string[], setter: Function) => {
    setter((prev: string[]) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  /** QuickAddDialog stays the same (unchanged) */
  /** Enhanced QuickAddDialog (UI improved, logic unchanged) */
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
const [qtyById, setQtyById] = useState<Record<string, string>>({});
    // 🔹 Build all diet items
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

    // 🔹 Allowed / gated items (yoga or diet)
    const gated = useMemo(() => {
      if (timeLabel === "Yoga Time") {
        const yogaArr: any[] = [];
        yogaCategories.forEach((cat: any) => {
          cat.subCategories?.forEach((sub: any) => {
            sub.items?.forEach((item: any) => {
              yogaArr.push({
                id: item.id,
                name: item.name,
                categoryName: cat.name,
                subCategoryName: sub.name,
              });
            });
          });
        });
        return yogaArr;
      }
      return allItems.filter((i) =>
        isAllowedForTiming(timeLabel, i.categoryName)
      );
    }, [allItems, timeLabel, yogaCategories]);

    // 🔹 Automatically preselect gated items when dialog opens
    // useEffect(() => {
    //   if (open && gated.length > 0) {
    //     // Only preselect if nothing is selected yet
    //     setSelectedItems((prev) =>
    //       prev.length === 0 ? gated.map((i) => i.id) : prev
    //     );
    //   }
    // }, [open, gated]);

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
      selectedItems.forEach((itemId) =>
        addDietItemToMeal(date, time, itemId, qtyById[itemId])
      );
      setSelectedItems([]);
      setSearchQuery("");
      setQtyById({});
      setOpen(false);
    };
    const grouped: Record<
      string,
      Record<string, typeof gated>
    > = useMemo(() => {
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
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 border border-gray-300 hover:bg-blue-50"
            title="Add items"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl w-full max-h-[90vh] rounded-xl border border-gray-200 bg-white shadow-lg flex flex-col">
          {/* Header */}
          <DialogHeader className="pb-2 flex-shrink-0">
            <DialogTitle>
              {timeLabel === "Yoga Time"
                ? "🧘 Select Yoga Asanas"
                : "Add Items"}{" "}
              • {format(date, "MMM d")} • {timeLabel}
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative flex-shrink-0">
            <Input
              placeholder="Search by item / short form / category / subcategory…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-gray-300 focus-visible:ring-blue-500"
            />
          </div>

          {/* Selected Count Bar */}
          {selectedItems.length > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2 rounded-md mt-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} selected
              </span>
              <Button
                size="sm"
                onClick={addSelectedItems}
                className="bg-blue-600 text-white"
              >
                Add Selected
              </Button>
            </div>
          )}

          {/* Scrollable Content */}
          <ScrollArea className="h-[55vh] mt-4 pr-3">
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, subs]) => (
                <div
                  key={cat}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-1">
                    <span className="text-yellow-600">📂</span> {cat}
                  </h3>

                  {Object.entries(subs).map(([subName, items]) => (
                    <div key={subName} className="ml-2 mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                        <span>{subName}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          ({items.length} items)
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-2">
                        {items.map((item) => {
                          const checked = selectedItems.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? "bg-blue-50 border-blue-400 shadow-sm"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleItem(item.id)}
                                className="w-4 h-4 mt-0.5 accent-blue-600"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate text-gray-800">
                                  {item.name}
                                </div>
                                {item.subForm && (
                                  <div className="text-xs text-blue-600 font-medium mt-1 truncate">
                                    {item.subForm}
                                  </div>
                                )}
                                {checked && (
  <Input
    placeholder="Qty e.g. 3-4"
    value={qtyById[item.id] || ""}
    onChange={(e) =>
      setQtyById((prev) => ({ ...prev, [item.id]: e.target.value }))
    }
    onClick={(e) => e.stopPropagation()}
    className="h-6 text-[10px] mt-1"
  />
)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {Object.keys(grouped).length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="font-medium text-gray-700">
                    No diet items for this time slot
                  </div>
                  <div className="text-sm mt-1 text-gray-500">
                    Try another slot or adjust your category rules
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedItems([]);
                setSearchQuery("");
              }}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={addSelectedItems}
              disabled={selectedItems.length === 0}
              className="bg-blue-600 text-white"
            >
              {selectedItems.length > 0
                ? `Add (${selectedItems.length})`
                : "Add"}
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
          <table className="w-full border-collapse min-w-[700px] text-xs">
            <thead>
              <tr className="bg-wellness-primary/10">
                <th className="border border-wellness-muted p-2 text-left font-semibold sticky left-0 bg-wellness-primary/10 z-10 min-w-[130px]">
                  Timing
                </th>
                {weekDays.map((date, dateIdx) => {
                  const isToday =
                    format(date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                  return (
                    <th
                      key={dateIdx}
                      className={`border border-wellness-muted p-1 text-center font-semibold text-[11px] min-w-[110px] ${
                        isToday ? "bg-wellness-soft/50" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div
                          className={`font-medium ${
                            isToday ? "text-wellness-primary" : ""
                          }`}
                        >
                          {format(date, "dd/MM")}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {format(date, "EEE")}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {mealTimingsState.map((mt, mtIdx) => (
                <tr key={mtIdx}>
                  <td className="border border-wellness-muted p-2 sticky left-0 bg-white dark:bg-card z-10 align-top">
                    <div className="flex flex-col gap-1">
                      <Select
                        value={mt.label}
                        onValueChange={(val) => {
                          const next = [...mealTimingsState];
                          next[mtIdx] = { ...mt, label: val };
                          setMealTimingsState(next);
                        }}
                      >
                        <SelectTrigger className="h-7 text-[11px]">
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
                          next[mtIdx] = { ...mt, time: val };
                          setMealTimingsState(next);
                          if (oldTime !== val) renameMealTimeKey(oldTime, val);
                        }}
                      >
                        <SelectTrigger className="h-7 text-[11px]">
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
                  </td>

                  {weekDays.map((date, dateIdx) => {
                    const dateKey = getDateKey(date);
                    const cell = mealPlans[dateKey]?.[mt.time];
                    const ids = cell?.itemIds || [];

                    return (
                      <td
                        key={dateIdx}
                        className="border border-wellness-muted p-1.5"
                      >
                        <div className="flex flex-wrap gap-1 mb-1 min-h-[22px]">
                          {ids.length === 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              No items
                            </span>
                          )}
                          {ids.map((id) => (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]"
                            >
                          {cell?.itemQty?.[id] ? `${cell.itemQty[id]} ` : ""}
{dietItemMap[id]?.label || id}
                              <button
                                type="button"
                                className="ml-1 p-0.5 hover:bg-blue-100 rounded"
                                onClick={() =>
                                  removeDietItemFromMeal(date, mt.time, id)
                                }
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        <Textarea
                          value={cell?.text || ""}
                          onChange={(e) =>
                            updateMealPlanText(date, mt.time, e.target.value)
                          }
                          placeholder='Enter text or use "Add items" button'
                          className="min-h-[50px] text-[11px] resize-none"
                        />

                        {mt.label === "Yoga Time" ||
                        CATEGORY_RULES[mt.label]?.length ? (
                          <div className="flex justify-end mt-1">
                            <QuickAddDialog
                              date={date}
                              time={mt.time}
                              timeLabel={mt.label}
                            />
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">
                            No items allowed for {mt.label}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
<Card className="wellness-card">
  <CardHeader className="pb-2">
    <CardTitle className="text-base">
      Diet Duration
    </CardTitle>
  </CardHeader>

  <CardContent>
    <Input
      type="number"
      min={1}
      value={dietDuration}
      onChange={(e) =>
        setDietDuration(
          Number(e.target.value) || 1
        )
      }
      placeholder="Number of days"
    />
  </CardContent>
</Card>
      {/* NEW: Common restrictions/notes under the table */}
      <Card className="wellness-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Common Restrictions / Notes
          </CardTitle>
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
      {/* Checkboxes Section */}
      <div className="space-y-4">
         <div>
          <h3 className="font-semibold mb-2">fruits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {fruits.map((fruit) => (
              <label key={fruit} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedFruits.includes(fruit)}
                  onCheckedChange={() =>
                    toggleCheckbox(fruit, selectedFruits, setSelectedFruits)
                  }
                />
                {fruit}
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">🥦 Vegetables</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {vegOptions.map((veg) => (
              <label key={veg} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedVeg.includes(veg)}
                  onCheckedChange={() =>
                    toggleCheckbox(veg, selectedVeg, setSelectedVeg)
                  }
                />
                {veg}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">🥣 Dal</h3>
          <div className="flex flex-wrap gap-3">
            {dalOptions.map((dal) => (
              <label key={dal} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedDal.includes(dal)}
                  onCheckedChange={() =>
                    toggleCheckbox(dal, selectedDal, setSelectedDal)
                  }
                />
                {dal}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">🌾 Atta (Flour)</h3>
          <div className="flex flex-wrap gap-3">
            {attaOptions.map((atta) => (
              <label key={atta} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedAtta.includes(atta)}
                  onCheckedChange={() =>
                    toggleCheckbox(atta, selectedAtta, setSelectedAtta)
                  }
                />
                {atta}
              </label>
            ))}
          </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DietTableView;
