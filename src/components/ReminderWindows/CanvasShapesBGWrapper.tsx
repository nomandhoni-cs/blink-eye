import CanvasShapes from "../backgrounds/ParticleAnimation";

const CanvasShapesBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <CanvasShapes shape="circle" speed={8} numberOfItems={60} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default CanvasShapesBGWrapper;
