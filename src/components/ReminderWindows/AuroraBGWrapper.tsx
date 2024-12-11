import { AuroraBackground } from "../backgrounds/Aurora";

const AuroraBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AuroraBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuroraBGWrapper;
