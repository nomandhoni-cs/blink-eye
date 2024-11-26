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

export default function HowBlinkEyeWillHelp() {
  //   const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const benefits = [
    {
      title: "Eye Care and Protection",
      description:
        "Protect your eyes from digital strain, reduce blue light exposure, and prevent Computer Vision Syndrome (CVS).",
      icon: EyeIcon,
      details: [
        {
          subtitle: "Prevent Digital Eye Strain",
          content:
            "Scheduled breaks reduce symptoms like dry eyes, blurry vision, and headaches, ensuring long-term eye health.",
        },
        {
          subtitle: "Blue Light Protection",
          content:
            "Rest your eyes regularly with prompts designed to combat the harmful effects of blue light exposure.",
        },
      ],
    },
    {
      title: "Physical Health",
      description:
        "Improve posture, prevent Repetitive Strain Injuries (RSI), and reduce physical discomfort.",
      icon: ActivityIcon,
      details: [
        {
          subtitle: "Prevent Repetitive Strain Injuries (RSI)",
          content:
            "Regular breaks minimize strain on your hands and wrists, preventing long-term damage from repetitive tasks.",
        },
        {
          subtitle: "Support Better Posture",
          content:
            "Encourages stretching and posture checks to avoid issues like tech neck and back pain.",
        },
      ],
    },
    {
      title: "Mental Wellness",
      description:
        "Boost your focus, mindfulness, and reduce stress effortlessly.",
      icon: BrainIcon,
      details: [
        {
          subtitle: "Enhance Focus and Mindfulness",
          content:
            "Regular breaks help you stay sharp and focused while reducing mental fatigue and burnout.",
        },
        {
          subtitle: "Stress Management",
          content:
            "Use break intervals to practice relaxation techniques, reducing work-induced stress and tension.",
        },
      ],
    },
    {
      title: "Boosted Productivity",
      description:
        "Work smarter, not harder, with productivity-focused methods.",
      icon: ZapIcon,
      details: [
        {
          subtitle: "Pomodoro Technique Integration",
          content:
            "Break tasks into manageable intervals for efficient work sessions, improving task completion rates.",
        },
        {
          subtitle: "Cognitive Efficiency",
          content:
            "Strategic breaks enhance your mental performance, helping you achieve more with less effort.",
        },
      ],
    },
    {
      title: "Healthy Screen-Time Habits",
      description:
        "Develop disciplined screen-time practices and minimize unnecessary distractions.",
      icon: HeartIcon,
      details: [
        {
          subtitle: "Structured Screen-Time",
          content:
            "Build healthy digital habits with well-timed reminders for work and relaxation balance.",
        },
        {
          subtitle: "Reduce Multitasking",
          content:
            "Focus fully on tasks by minimizing distractions during your work and relaxation cycles.",
        },
      ],
    },
    {
      title: "Sustainable Long-Term Benefits",
      description:
        "Avoid chronic issues and maintain balance for years to come.",
      icon: ClockIcon,
      details: [
        {
          subtitle: "Prevent Chronic Vision Problems",
          content:
            "Take proactive measures to reduce risks of long-term digital vision problems caused by screen overuse.",
        },
        {
          subtitle: "Achieve Work-Life Balance",
          content:
            "Create sustainable habits for work and personal life with a balanced approach to productivity.",
        },
      ],
    },
    {
      title: "Flexible and Customizable",
      description:
        "Tailor your experience to fit your lifestyle, profession, and individual needs.",
      icon: SettingsIcon,
      details: [
        {
          subtitle: "Customizable Break Timers",
          content:
            "Set intervals that match your workflow, ensuring the app complements your unique schedule.",
        },
        {
          subtitle: "Built for Everyone",
          content:
            "Whether you’re a student, developer, designer, or remote worker, the app adapts to your needs.",
        },
      ],
    },
    {
      title: "Research-Backed Benefits",
      description:
        "Enjoy features grounded in productivity and wellness studies.",
      icon: BookOpenIcon,
      details: [
        {
          subtitle: "Evidence-Based Features",
          content:
            "The app’s design is inspired by research in productivity, focus, and digital well-being.",
        },
        {
          subtitle: "Trusted by Users",
          content:
            "Real user testimonials and success stories validate its effectiveness and value.",
        },
      ],
    },
    {
      title: "Enhanced Energy and Mood",
      description:
        "Feel energized and stay positive throughout the day with balanced work breaks.",
      icon: SunIcon,
      details: [
        {
          subtitle: "Boost Daily Energy",
          content:
            "Short, regular breaks help recharge your mind and body, keeping you energized for the day ahead.",
        },
        {
          subtitle: "Maintain a Positive Mood",
          content:
            "Break the monotony of continuous screen time to reduce frustration and enhance your overall mood.",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl text-center py-4">
        <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl">
          How Blink Eye Will Help You
        </h2>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8 py-4">
        <b>Take control of your well-being with Blink Eye. </b> Discover how
        scheduled breaks can improve eye health, enhance focus, boost
        productivity, and promote long-term wellness for a balanced digital
        lifestyle.
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
                  <AccordionTrigger>Learn More</AccordionTrigger>
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
