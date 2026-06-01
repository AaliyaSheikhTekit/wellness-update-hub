import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar, 
  User, 
  Heart, 
  Stethoscope, 
  Activity,
  Brain,
  Wind,
  Bone,
  Apple,
  TestTube,
  Pill,
  ClipboardList,
  Download,
  ExternalLink
} from "lucide-react";

interface Systemic {
  nrvousSystem?: string;
  respiratorySystem?: string;
  cardioVascularSystem?: string;
  musculoskeletalSystem?: string;
  gastroIntestinalSystem?: string;
}

interface InvestigationsOrDiagnosis {
  investigations?: string;
  investigationsUrl?: string;
  provisionalDiagnosis?: string;
  provisionalDiagnosisUrl?: string;
}

interface DietChart {
  title?: string;
  restrictions?: string;
}

interface YogaChart {
  title?: string;
  duration?: string;
}

interface Treatment {
  recommendation: any;
  dietChart?: DietChart | string;
  yogaChart?: YogaChart | string;
  treatmentPlan?: string;
}

interface Consultation {
  id: string;
  chronicIllnesses?: string;
  surgeriesOrInjuries?: string;
  allergies?: string;
  familyHistory?: string;
  systemic?: Systemic | null;
  investigationsOrDiagnosis?: InvestigationsOrDiagnosis | null;
  treatment?: Treatment | null;
  doctorName?: string | null;
  yogaChart?: string | null;
  includeYoga?: boolean;
  signature?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Additional fields for compatibility
  title?: string;
  consultationType?: string;
  date?: string;
  status?: string;
  severity?: string;
  diagnosis?: string;
  assessment?: string;
  plan?: string;
  recommendation?: string;
  note?: string;
  notes?: string;
  prescriptions?: any[];
  consent?: boolean;
  patientSignature?: string | null;
}

interface ConsultationHistoryProps {
  consultations?: Consultation[];
  appointment?: {
    consultationType?: string;
    date?: string;
    createdAt?: string;
  } | null;
  dateFormatter?: (date: string | Date) => string;
  showHeader?: boolean;
  embedded?: boolean;
}


const ConsultationHistory = ({ 
  consultations: propConsultations,
  appointment,
  dateFormatter,
  showHeader = true,
  embedded = false
}: ConsultationHistoryProps = {}) => {
  const consultations = propConsultations ;

  const formatDate = (dateString: string) => {
    if (dateFormatter) {
      return dateFormatter(dateString);
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

const InfoSection = ({
  icon: Icon,
  title,
  content,
}: {
  icon: any;
  title: string;
  content?: any;
}) => {
  if (
    content === null ||
    content === undefined ||
    content === "" ||
    (typeof content === "object" && Object.keys(content).length === 0)
  ) {
    return null;
  }

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-muted-foreground mb-1">
          {title}
        </p>

        <p className="text-sm text-foreground break-words">
          {typeof content === "object"
            ? JSON.stringify(content)
            : content}
        </p>
      </div>
    </div>
  );
};

  const containerClass = embedded 
    ? "" 
    : "min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6";

  const contentWrapperClass = embedded ? "" : "max-w-7xl mx-auto space-y-6";
const getSystemicValue = (system: any) => {
  if (!system) return "";

  if (typeof system === "string") {
    return system;
  }

  if (system.ad) {
    return `AD${
      system.adDescription ? ` - ${system.adDescription}` : ""
    }`;
  }

  if (system.nad) {
    return "NAD";
  }

  return "";
};
  return (
    <div className={containerClass}>
      <div className={contentWrapperClass}>
        {/* Header */}
        {showHeader && (
          <Card className="shadow-xl border-0 overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-emerald-400 to-teal-200 text-white pb-7">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Consultations</CardTitle>
                <Badge variant="secondary" className="bg-white/20">
                  {consultations.length} total
                </Badge>
              </div>
              {appointment && (
                <p className="text-emerald-100 text-sm mt-1">
                  Showing consultations for the selected appointment (
                  {appointment.consultationType || "—"}) on{" "}
                  {formatDate(appointment.date || appointment.createdAt || "")}
                </p>
              )}
            </CardHeader>
          </Card>
        )}
        
        {!showHeader && appointment && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Consultation History</h1>
              <p className="text-muted-foreground">Complete medical consultation records</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {consultations.length} Records
            </Badge>
          </div>
        )}

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center">
                No consultations found for this appointment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {consultations.map((consultation, index) => (
            <AccordionItem 
              key={consultation.id} 
              value={consultation.id}
              className="border-none"
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <AccordionTrigger className="hover:no-underline p-0">
                  <CardHeader className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-xl">Consultation #{consultations.length - index}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm text-emerald-100">
                              {formatDate(consultation.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {consultation.doctorName && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          <User className="w-3 h-3 mr-1" />
                          {consultation.doctorName}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </AccordionTrigger>

                <AccordionContent>
                  <CardContent className="p-6">
                    <Tabs defaultValue="medical-history" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="medical-history">Medical History</TabsTrigger>
                        <TabsTrigger value="examination">Examination</TabsTrigger>
                        <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                        <TabsTrigger value="treatment">Treatment</TabsTrigger>
                      </TabsList>

                      {/* Medical History Tab */}
                      <TabsContent value="medical-history" className="space-y-4">
                        <InfoSection 
                          icon={Heart} 
                          title="Chronic Illnesses" 
                          content={consultation.chronicIllnesses}
                        />
                        <InfoSection 
                          icon={Stethoscope} 
                          title="Surgeries or Injuries" 
                          content={consultation.surgeriesOrInjuries}
                        />
                        <InfoSection 
                          icon={Activity} 
                          title="Allergies" 
                          content={consultation.allergies}
                        />
                        <InfoSection 
                          icon={User} 
                          title="Family History" 
                          content={consultation.familyHistory}
                        />
                      </TabsContent>

                      {/* Examination Tab */}
                     <TabsContent value="examination" className="space-y-4">
  {consultation.systemic ? (
    <>
      <InfoSection
        icon={Brain}
        title="Nervous System"
        content={getSystemicValue(
          consultation.systemic?.nrvousSystem
        )}
      />

      <InfoSection
        icon={Wind}
        title="Respiratory System"
        content={getSystemicValue(
          consultation.systemic?.respiratorySystem
        )}
      />

      <InfoSection
        icon={Heart}
        title="Cardiovascular System"
        content={getSystemicValue(
          consultation.systemic?.cardioVascularSystem
        )}
      />

      <InfoSection
        icon={Bone}
        title="Musculoskeletal System"
        content={getSystemicValue(
          consultation.systemic?.musculoskeletalSystem
        )}
      />

      <InfoSection
        icon={Apple}
        title="Gastrointestinal System"
        content={getSystemicValue(
          consultation.systemic?.gastroIntestinalSystem
        )}
      />
    </>
  ) : (
    <p className="text-center text-muted-foreground py-8">
      No systemic examination data available
    </p>
  )}
</TabsContent>

                      {/* Diagnosis Tab */}
                      <TabsContent value="diagnosis" className="space-y-4">
                        {consultation.investigationsOrDiagnosis ? (
                          <>
                            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <TestTube className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-muted-foreground mb-1">Investigations</p>
                                  <p className="text-sm text-foreground mb-3">
                                    {consultation.investigationsOrDiagnosis.investigations || "Not specified"}
                                  </p>
                                  {consultation.investigationsOrDiagnosis.investigationsUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a 
                                        href={consultation.investigationsOrDiagnosis.investigationsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        View Report
                                        <ExternalLink className="w-3 h-3 ml-2" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                  <ClipboardList className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-muted-foreground mb-1">Provisional Diagnosis</p>
                                  <p className="text-sm text-foreground mb-3">
                                    {consultation.investigationsOrDiagnosis.provisionalDiagnosis || "Not specified"}
                                  </p>
                                  {consultation.investigationsOrDiagnosis.provisionalDiagnosisUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a 
                                        href={consultation.investigationsOrDiagnosis.provisionalDiagnosisUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        View Diagnosis Report
                                        <ExternalLink className="w-3 h-3 ml-2" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No diagnosis data available</p>
                        )}
                      </TabsContent>

                      {/* Treatment Tab */}
                    <TabsContent value="treatment" className="space-y-4">
  {consultation.treatment ? (
    <>
      <InfoSection
        icon={Apple}
        title="Diet Chart"
        content={
          consultation.treatment?.dietChart && typeof consultation.treatment.dietChart === "object"
            ? `
Title: ${
                consultation.treatment.dietChart.title || "-"
              }
Restrictions: ${
                consultation.treatment.dietChart.restrictions || "-"
              }
`
            : ""
        }
      />

      {consultation.includeYoga && (
        <InfoSection
          icon={Activity}
          title="Yoga Chart"
          content={
              consultation.treatment?.yogaChart
                ? typeof consultation.treatment.yogaChart === "object"
                  ? `
  Title: ${consultation.treatment.yogaChart.title || "-"}
  Duration: ${consultation.treatment.yogaChart.duration || "-"}
  `
                  : `
  Title: ${consultation.treatment.yogaChart || "-"}
  `
                : ""
            }
        />
      )}

      <InfoSection
        icon={Pill}
        title="Recommendations"
        content={
          consultation.treatment?.recommendation?.title?.length
            ? consultation.treatment.recommendation.title.join(
                ", "
              )
            : "No recommendation provided"
        }
      />
    </>
  ) : (
    <p className="text-center text-muted-foreground py-8">
      No treatment plan available
    </p>
  )}

  {consultation.signature && (
    <div className="mt-6 pt-6 border-t">
      <p className="text-sm text-muted-foreground mb-2">
        Doctor Signature
      </p>

      <div className="p-4 bg-muted/30 rounded-lg">
        <img
          src={consultation.signature}
          alt="Doctor Signature"
          className="h-20 object-contain"
        />
      </div>
    </div>
  )}

  {consultation.patientSignature && (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-2">
        Patient Signature
      </p>

      <div className="p-4 bg-muted/30 rounded-lg">
        <img
          src={consultation.patientSignature}
          alt="Patient Signature"
          className="h-20 object-contain"
        />
      </div>
    </div>
  )}

  {consultation.consent !== undefined && (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-2">
        Consent Status
      </p>

      <Badge
        variant={
          consultation.consent ? "default" : "destructive"
        }
      >
        {consultation.consent
          ? "Consent Given"
          : "Consent Not Given"}
      </Badge>
    </div>
  )}
</TabsContent>
                    </Tabs>

                    {/* Updated timestamp */}
                    <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                      Last updated: {formatDate(consultation.updatedAt)}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default ConsultationHistory;
