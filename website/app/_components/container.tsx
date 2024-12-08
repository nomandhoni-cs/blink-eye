type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="max-w-7xl mx-auto px-5">{children}</div>;
};

export default Container;
