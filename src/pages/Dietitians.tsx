import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  cookedBreakfast,
  dieticianNotes} from '@/data/dietData'
import { medicatedWaterRecipes, sweetDishes, soups } from "@/data/recipes";
import { Droplets, Coffee, Sprout, Apple, Leaf, ChefHat, BookOpen, FileText, User, Utensils, AlertTriangle, Save } from "lucide-react";

// Mock patients data
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

const DieticianView = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("medicated-waters");
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

  const addFoodToMeal = (mealTime: string, food: string) => {
    const currentFoods = dietForm.mealPlan[mealTime] || [];
    if (!currentFoods.includes(food)) {
      handleMealPlanChange(mealTime, [...currentFoods, food]);
    }
  };

  const removeFoodFromMeal = (mealTime: string, foodIndex: number) => {
    const currentFoods = dietForm.mealPlan[mealTime] || [];
    const updatedFoods = currentFoods.filter((_, index) => index !== foodIndex);
    handleMealPlanChange(mealTime, updatedFoods);
  };

  const PatientsList = () => (
    <Card className="wellness-card-gradient wellness-shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-wellness-primary">
          <User className="w-5 h-5" />
          Patients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockPatients.map((patient) => (
          <div
            key={patient.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedPatient === patient.id 
                ? 'bg-wellness-primary/10 border-wellness-primary' 
                : 'bg-card hover:bg-wellness-soft/30'
            }`}
            onClick={() => setSelectedPatient(patient.id)}
          >
            <h3 className="font-semibold text-foreground">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
            <p className="text-sm text-muted-foreground">{patient.condition}</p>
            <div className="flex items-center gap-1 mt-2">
              <Utensils className="h-3 w-3 text-wellness-primary" />
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
  );

  const DietPlanCreator = () => {
    const selectedPatientData = mockPatients.find(p => p.id === selectedPatient);
    
    if (!selectedPatient) {
      return (
        <Card className="wellness-card-gradient wellness-shadow-soft">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a Patient</h3>
              <p className="text-muted-foreground">Choose a patient from the list to create a personalized diet plan</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="wellness-card-gradient wellness-shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wellness-primary">
            <ChefHat className="w-5 h-5" />
            Create Diet Plan for {selectedPatientData?.name}
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

          {/* Meal Planning with Diet Categories */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Meal Plan</Label>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {mealTimings.map((mealTime) => (
                  <div key={mealTime} className="space-y-3">
                    <Label className="text-sm font-medium">{mealTime}</Label>
                    
                    {/* Food Selection */}
                    <div className="border rounded-lg p-4 bg-wellness-soft/20">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <Select onValueChange={(value) => addFoodToMeal(mealTime, value)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Medicated Waters" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicatedWaters.map((water) => (
                              <SelectItem key={water.name} value={water.name}>
                                {water.name} ({water.shortForm})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select onValueChange={(value) => addFoodToMeal(mealTime, value)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Fruits" />
                          </SelectTrigger>
                          <SelectContent>
                            {fruits.map((fruit) => (
                              <SelectItem key={fruit} value={fruit}>{fruit}</SelectItem>
                            ))}
                            {dryFruits.map((fruit) => (
                              <SelectItem key={fruit.name} value={fruit.name}>
                                {fruit.name} ({fruit.shortForm})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select onValueChange={(value) => addFoodToMeal(mealTime, value)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Vegetables & Grains" />
                          </SelectTrigger>
                          <SelectContent>
                            {vegetables.map((veg) => (
                              <SelectItem key={veg} value={veg}>{veg}</SelectItem>
                            ))}
                            {rotis.map((roti) => (
                              <SelectItem key={roti} value={roti}>{roti}</SelectItem>
                            ))}
                            {pulses.map((pulse) => (
                              <SelectItem key={pulse} value={pulse}>{pulse}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select onValueChange={(value) => addFoodToMeal(mealTime, value)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Others" />
                          </SelectTrigger>
                          <SelectContent>
                            {sprouts.map((sprout) => (
                              <SelectItem key={sprout} value={sprout}>{sprout}</SelectItem>
                            ))}
                            {cookedBreakfast.map((item) => (
                              <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                            {juices.map((juice) => (
                              <SelectItem key={juice.name} value={juice.name}>
                                {juice.name} ({juice.shortForm})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Selected Foods */}
                      {dietForm.mealPlan[mealTime] && dietForm.mealPlan[mealTime].length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dietForm.mealPlan[mealTime].map((food, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {food}
                              <button 
                                className="ml-1 text-destructive hover:text-destructive/80"
                                onClick={() => removeFoodFromMeal(mealTime, index)}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
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

          {/* Dietician Notes Preview */}
          <div className="bg-wellness-soft/30 p-4 rounded-lg border border-wellness-muted">
            <h4 className="font-semibold text-foreground mb-2">Standard Dietary Guidelines</h4>
            <div className="text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{dieticianNotes}</pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="wellness">
              <Save className="h-4 w-4 mr-2" />
              Save Diet Plan
            </Button>
            <Button variant="wellnessOutline">
              Preview Plan
            </Button>
            <Button variant="wellnessOutline">
              Send to Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DietPlanNotes = () => (
    <Card className="wellness-card-gradient wellness-shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-wellness-primary">
          <FileText className="w-5 h-5" />
          Important Dietary Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {dieticianNotes}
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Dietician Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive diet planning tools with traditional recipes and patient management
          </p>
        </div>

        <Tabs defaultValue="patients" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-2 wellness-card-gradient">
            <TabsTrigger value="patients" className="flex items-center gap-2 py-3">
              <User className="w-4 h-4" />
              Patients & Plans
            </TabsTrigger>
            <TabsTrigger value="diet-categories" className="flex items-center gap-2 py-3">
              <Apple className="w-4 h-4" />
              Diet Categories
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2 py-3">
              <ChefHat className="w-4 h-4" />
              Recipes
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              Guidelines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Patient List */}
              <div className="lg:col-span-1">
                <PatientsList />
              </div>
              
              {/* Diet Plan Creator */}
              <div className="lg:col-span-3">
                <DietPlanCreator />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diet-categories" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Category Selector */}
              <Card className="lg:col-span-1 wellness-card-gradient wellness-shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Food Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={selectedCategory === "medicated-waters" ? "wellness" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedCategory("medicated-waters")}
                  >
                    <Droplets className="w-4 h-4" />
                    Medicated Waters
                  </Button>
                  <Button
                    variant={selectedCategory === "teas" ? "wellness" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedCategory("teas")}
                  >
                    <Coffee className="w-4 h-4" />
                    Quath & Teas
                  </Button>
                  <Button
                    variant={selectedCategory === "sprouts" ? "wellness" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedCategory("sprouts")}
                  >
                    <Sprout className="w-4 h-4" />
                    Sprouts
                  </Button>
                  <Button
                    variant={selectedCategory === "fruits" ? "wellness" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedCategory("fruits")}
                  >
                    <Apple className="w-4 h-4" />
                    Fruits & Dry Fruits
                  </Button>
                  <Button
                    variant={selectedCategory === "vegetables" ? "wellness" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedCategory("vegetables")}
                  >
                    <Leaf className="w-4 h-4" />
                    Vegetables & Grains
                  </Button>
                </CardContent>
              </Card>

              {/* Category Content */}
              <div className="lg:col-span-3">
                <Card className="wellness-card-gradient wellness-shadow-soft">
                  <CardHeader>
                    <CardTitle className="capitalize text-wellness-primary">
                      {selectedCategory.replace("-", " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {selectedCategory === "medicated-waters" && (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {medicatedWaters.map((water, index) => (
                              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                <span className="font-medium text-foreground">{water.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {water.shortForm}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedCategory === "teas" && (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {quathAndTeas.map((tea, index) => (
                              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                <span className="font-medium text-foreground">{tea.name}</span>
                                {tea.shortForm && (
                                  <Badge variant="secondary" className="text-xs">
                                    {tea.shortForm}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedCategory === "sprouts" && (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sprouts.map((sprout, index) => (
                              <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                <span className="font-medium text-foreground">{sprout}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedCategory === "fruits" && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-lg text-foreground mb-3">Dry Fruits</h4>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dryFruits.map((fruit, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                    <span className="font-medium text-foreground">{fruit.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {fruit.shortForm}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold text-lg text-foreground mb-3">Fresh Fruits</h4>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {fruits.map((fruit, index) => (
                                  <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                    <span className="font-medium text-foreground">{fruit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedCategory === "vegetables" && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-lg text-foreground mb-3">Vegetables</h4>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {vegetables.map((vegetable, index) => (
                                  <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                    <span className="font-medium text-foreground">{vegetable}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold text-lg text-foreground mb-3">Rotis & Grains</h4>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {rotis.map((roti, index) => (
                                  <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                    <span className="font-medium text-foreground">{roti}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-semibold text-lg text-foreground mb-3">Pulses & Legumes</h4>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {pulses.map((pulse, index) => (
                                  <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/50">
                                    <span className="font-medium text-foreground">{pulse}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="wellness-card-gradient wellness-shadow-soft">
                <CardHeader>
                  <CardTitle className="text-wellness-primary">Medicated Water Recipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {medicatedWaterRecipes.map((recipe, index) => (
                        <div key={index} className="p-4 rounded-lg border border-wellness-muted bg-wellness-soft/30">
                          <h4 className="font-semibold text-foreground mb-2">{recipe.name}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{recipe.recipe}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="wellness-card-gradient wellness-shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-wellness-primary">Sweet Dishes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-3">
                        {sweetDishes.map((dish, index) => (
                          <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/30">
                            <h5 className="font-semibold text-foreground mb-1">{dish.name}</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{dish.recipe}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="wellness-card-gradient wellness-shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-wellness-primary">Soups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-3">
                        {soups.map((soup, index) => (
                          <div key={index} className="p-3 rounded-lg border border-wellness-muted bg-wellness-soft/30">
                            <h5 className="font-semibold text-foreground mb-1">{soup.name}</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{soup.recipe}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guidelines">
            <DietPlanNotes />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DieticianView;