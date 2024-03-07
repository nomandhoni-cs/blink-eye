import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
};
const Features = () => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="list-disc ml-6">
          <li>Customizable reminder timers.</li>
          <li>Full-screen popups with a 20-second countdown.</li>
          <li>Audio mute during reminders.</li>
          <li>Quick access links for easy navigation.</li>
        </ul>
      </div>
    </div>
  );
};

export default Features;
