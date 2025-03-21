import ParticleBackground from "../backgrounds/ParticleBackground";

const ParticleBackgroundBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ParticleBackgroundBGWrapper;
