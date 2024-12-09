import "@/styles/globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return <>{children}</>;
};

export default RootLayout;
