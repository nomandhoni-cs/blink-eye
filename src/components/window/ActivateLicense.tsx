import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ActivateLicense = () => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4">
        Activate your Blink Eye license
      </h3>
      <Label htmlFor="licensekey">Enter your license key</Label>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          id="licensekey"
          placeholder="AE4E6644-XXXX-4433-XXXX-FFB2FE668E23"
        />
        <Button type="submit">Activate</Button>
      </div>
    </>
  );
};

export default ActivateLicense;
