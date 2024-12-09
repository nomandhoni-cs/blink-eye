import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  EyeIcon,
  ActivityIcon,
  BrainIcon,
  ZapIcon,
  HeartIcon,
  ClockIcon,
  SettingsIcon,
  BookOpenIcon,
  SunIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function HowBlinkEyeWillHelp() {
  //   const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const t = useTranslations("howBlinkEyeWillHelp");

  const benefits = [
    {
      title: t("title1"),
      description: t("description1"),
      icon: EyeIcon,
      details: [
        {
          subtitle: t("preventDigitalEyeStrain"),
          content: t("preventDigitalEyeStrainDetails"),
        },
        {
          subtitle: t("blueLightProtection"),
          content: t("blueLightProtectionDetails"),
        },
      ],
    },
    {
      title: t("title2"),
      description: t("description2"),
      icon: ActivityIcon,
      details: [
        {
          subtitle: t("preventRepetitiveStrainInjuries"),
          content: t("preventRepetitiveStrainInjuriesDetails"),
        },
        {
          subtitle: t("supportBetterPosture"),
          content: t("supportBetterPostureDetails"),
        },
      ],
    },
    {
      title: t("title3"),
      description: t("description3"),
      icon: BrainIcon,
      details: [
        {
          subtitle: t("enhanceFocusAndMindfulness"),
          content: t("enhanceFocusAndMindfulnessDetails"),
        },
        {
          subtitle: t("stressManagement"),
          content: t("stressManagementDetails"),
        },
      ],
    },
    {
      title: t("title4"),
      description: t("description4"),
      icon: ZapIcon,
      details: [
        {
          subtitle: t("pomodoroTechniqueIntegration"),
          content: t("pomodoroTechniqueIntegrationDetails"),
        },
        {
          subtitle: t("cognitiveEfficiency"),
          content: t("cognitiveEfficiencyDetails"),
        },
      ],
    },
    {
      title: t("title5"),
      description: t("description5"),
      icon: HeartIcon,
      details: [
        {
          subtitle: t("structuredScreenTime"),
          content: t("structuredScreenTimeDetails"),
        },
        {
          subtitle: t("reduceMultitasking"),
          content: t("reduceMultitaskingDetails"),
        },
      ],
    },
    {
      title: t("title6"),
      description: t("description6"),
      icon: ClockIcon,
      details: [
        {
          subtitle: t("preventChronicVisionProblems"),
          content: t("preventChronicVisionProblemsDetails"),
        },
        {
          subtitle: t("achieveWorkLifeBalance"),
          content: t("achieveWorkLifeBalanceDetails"),
        },
      ],
    },
    {
      title: t("title7"),
      description: t("description7"),
      icon: SettingsIcon,
      details: [
        {
          subtitle: t("customizableBreakTimers"),
          content: t("customizableBreakTimersDetails"),
        },
        {
          subtitle: t("builtForEveryone"),
          content: t("builtForEveryoneDetails"),
        },
      ],
    },
    {
      title: t("title8"),
      description: t("description8"),
      icon: BookOpenIcon,
      details: [
        {
          subtitle: t("evidenceBasedFeatures"),
          content: t("evidenceBasedFeaturesDetails"),
        },
        {
          subtitle: t("trustedByUsers"),
          content: t("trustedByUsersDetails"),
        },
      ],
    },
    {
      title: t("title9"),
      description: t("description9"),
      icon: SunIcon,
      details: [
        {
          subtitle: t("boostDailyEnergy"),
          content: t("boostDailyEnergyDetails"),
        },
        {
          subtitle: t("maintainPositiveMood"),
          content: t("maintainPositiveMoodDetails"),
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl text-center py-4">
        <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl">
          {t("heading")}
        </h2>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8 py-4">
        <b>{t("body1")}</b> {t("body2")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
              <CardDescription>{benefit.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger>{t("learnMore")}</AccordionTrigger>
                  <AccordionContent>
                    {benefit.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="mb-4">
                        <h4 className="font-semibold mb-2">
                          {detail.subtitle}
                        </h4>
                        <p>{detail.content}</p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
