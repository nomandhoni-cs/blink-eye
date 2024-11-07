import { Toaster } from "react-hot-toast";
import Settings from "./Settings";
import { UpdateDialog } from "../BlinkEyeUpdater";
const Dashboard = () => {
  return (
    <div className="">
      <UpdateDialog />
      <Settings />
      <Toaster />
    </div>
  );
};

export default Dashboard;
