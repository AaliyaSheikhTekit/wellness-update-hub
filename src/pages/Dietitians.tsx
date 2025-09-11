import { useState } from "react";
import { User, Utensils, AlertTriangle, Plus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const mockPatients = [
  {
    id: 1,
    name: "Rahul Sharma",
    age: 45,
    condition: "Digestive Issues",
    currentDiet: "Vata Pacifying Diet",
    allergies: ["Dairy", "Nuts"],
    lastVisit: "2024-01-15"
  },
  {
    id: 2,
    name: "Priya Patel",
    age: 32,
    condition: "Stress Management",
    currentDiet: "Pitta Balancing Diet",
    allergies: [],
    lastVisit: "2024-01-14"
  },
  {
    id: 3,
    name: "Amit Kumar",
    age: 28,
    condition: "Skin Issues",
    currentDiet: "Detox Diet",
    allergies: ["Gluten"],
    lastVisit: "2024-01-13"
  }
];

const dietTypes = [
  "Vata Pacifying Diet",
  "Pitta Balancing Diet", 
  "Kapha Reducing Diet",
  "Detox Diet",
  "Weight Management Diet",
  "Diabetes Management Diet",
  "Heart Healthy Diet",
  "Anti-Inflammatory Diet",
  "Digestive Support Diet",
  "Immunity Boosting Diet"
];

const mealTimings = [
  "Early Morning (6:00 AM)",
  "Breakfast (8:00 AM)",
  "Mid-Morning (10:00 AM)",
  "Lunch (12:00 PM)",
  "Evening Snack (4:00 PM)",
  "Dinner (7:00 PM)",
  "Before Sleep (9:00 PM)"
];

const foodCategories = {
  "Grains": ["Brown Rice", "Quinoa", "Oats", "Millets", "Barley"],
  "Vegetables": ["Spinach", "Broccoli", "Carrots", "Beetroot", "Bottle Gourd"],
  "Fruits": ["Apple", "Banana", "Pomegranate", "Papaya", "Orange"],
  "Proteins": ["Lentils", "Chickpeas", "Paneer", "Fish", "Chicken"],
  "Dairy": ["Milk", "Yogurt", "Ghee", "Butter", "Cheese"],
  "Spices": ["Turmeric", "Ginger", "Cumin", "Coriander", "Fennel"]
};

const Dietitians = () => {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [dietForm, setDietForm] = useState({
    dietType: "",
    duration: "",
    specialInstructions: "",
    allergies: "",
    restrictions: "",
    mealPlan: {} as Record<string, string[]>
  });

  const handleMealPlanChange = (mealTime: string, foods: string[]) => {
    setDietForm(prev => ({
      ...prev,
      mealPlan: {
        ...prev.mealPlan,
        [mealTime]: foods
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dietitian Dashboard</h1>
          <p className="text-muted-foreground">Create and manage personalized diet plans for patients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <Card className="shadow-natural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient === patient.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-card hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <h3 className="font-semibold text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Utensils className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{patient.currentDiet}</span>
                    </div>
                    {patient.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            <AlertTriangle className="h-2 w-2 mr-1" />
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Diet Plan Form */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <Card className="shadow-natural">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Create Diet Plan for {mockPatients.find(p => p.id === selectedPatient)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Diet Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dietType">Diet Type</Label>
                      <Select value={dietForm.dietType} onValueChange={(value) => setDietForm(prev => ({...prev, dietType: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select diet type" />
                        </SelectTrigger>
                        <SelectContent>
                          {dietTypes.map((diet) => (
                            <SelectItem key={diet} value={diet}>{diet}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select value={dietForm.duration} onValueChange={(value) => setDietForm(prev => ({...prev, duration: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-week">1 Week</SelectItem>
                          <SelectItem value="2-weeks">2 Weeks</SelectItem>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Meal Planning */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Meal Plan</Label>
                    {mealTimings.map((mealTime) => (
                      <div key={mealTime} className="space-y-2">
                        <Label className="text-sm font-medium">{mealTime}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {Object.entries(foodCategories).map(([category, foods]) => (
                            <Select key={category} onValueChange={(value) => {
                              const currentFoods = dietForm.mealPlan[mealTime] || [];
                              if (!currentFoods.includes(value)) {
                                handleMealPlanChange(mealTime, [...currentFoods, value]);
                              }
                            }}>
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder={`Select ${category.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {foods.map((food) => (
                                  <SelectItem key={food} value={food}>{food}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ))}
                        </div>
                        {dietForm.mealPlan[mealTime] && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dietForm.mealPlan[mealTime].map((food, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {food}
                                <button 
                                  className="ml-1 text-destructive hover:text-destructive/80"
                                  onClick={() => {
                                    const updatedFoods = dietForm.mealPlan[mealTime].filter((_, i) => i !== index);
                                    handleMealPlanChange(mealTime, updatedFoods);
                                  }}
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

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies & Restrictions</Label>
                      <Textarea
                        id="allergies"
                        placeholder="Enter any food allergies or dietary restrictions..."
                        value={dietForm.allergies}
                        onChange={(e) => setDietForm(prev => ({...prev, allergies: e.target.value}))}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialInstructions">Special Instructions & Notes</Label>
                      <Textarea
                        id="specialInstructions"
                        placeholder="Enter special instructions, cooking methods, timing, portions, etc..."
                        value={dietForm.specialInstructions}
                        onChange={(e) => setDietForm(prev => ({...prev, specialInstructions: e.target.value}))}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button className="bg-primary hover:bg-primary-dark">
                      <Save className="h-4 w-4 mr-2" />
                      Save Diet Plan
                    </Button>
                    <Button variant="outline">
                      Preview Plan
                    </Button>
                    <Button variant="outline">
                      Send to Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-natural">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a Patient</h3>
                    <p className="text-muted-foreground">Choose a patient from the list to create a personalized diet plan</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dietitians;