import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  userHaveLicenseKey: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ userHaveLicenseKey }) => {
  return userHaveLicenseKey ? <Outlet /> : <Navigate to="/activatelicense" />;
};

export default PrivateRoute;
