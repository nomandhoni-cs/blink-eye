import { Clock, Timer, Shield, CheckCircle } from "lucide-react";
import AnimatedEyeBlinkLogo from "../AnimatedEyeBlinkLogo";

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative"></div>
        <h1 className="text-4xl font-heading">
          Thank you for installing Blink Eye
        </h1>
      </div>
      <AnimatedEyeBlinkLogo />
      <div className="flex items-center space-x-6 text-base font-heading text-foreground/70">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Smart Break Reminders</span>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="w-4 h-4" />
          <span>Screen Time Tracking</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>TODO List</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Open Source</span>
        </div>
      </div>
    </div>
  );
}
