import Features from "../features/page";
import HowToUse from "../howtouse/page";
import Privacy from "../privacy/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};
const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Blink Eye</h1>
      <p className="text-lg mb-8">
        Blink Eye is a minimalist eye care reminder app designed to reduce eye
        strain during extended screen usage. It provides customizable timers,
        full-screen popups, and audio mute functionality for a seamless user
        experience.
      </p>
      <Features />
      <HowToUse />
      <Privacy />
    </div>
  );
};

export default About;
