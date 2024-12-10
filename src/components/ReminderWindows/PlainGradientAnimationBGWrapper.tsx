import PlainGradientAnimation from "../backgrounds/PlainGradientAnimation";

const PlainGradientAnimationBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <PlainGradientAnimation />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default PlainGradientAnimationBGWrapper;
