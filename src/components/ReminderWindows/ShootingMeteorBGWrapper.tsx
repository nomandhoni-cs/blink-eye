import ShootingMeteor from "../backgrounds/ShootingMeteor";

const ShootingMeteorBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <ShootingMeteor number={50} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ShootingMeteorBGWrapper;
