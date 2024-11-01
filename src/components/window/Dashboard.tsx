import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { Toaster } from "react-hot-toast";
import { ModeToggle } from "../ThemeToggle";

import { Separator } from "../ui/seperator";
import Settings from "./Settings";

const Dashboard = () => {
  return (
    <div className="container p-8">
      <Tabs defaultValue="settings" className="w-full">
        <div className="flex justify-between items-center pb-2">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="usagetime">Usage Time</TabsTrigger>
          </TabsList>
          <ModeToggle />
        </div>
        <Separator />
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
        <TabsContent value="usagetime">
          {" "}
          <span>Usage Time Comming Soon!</span>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
};

export default Dashboard;
