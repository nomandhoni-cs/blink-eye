import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Clock } from "lucide-react";
import { ScrollArea } from "./scroll-area";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onOpen?: () => void; // Optional callback for when the picker is opened
}

// Generate arrays for hours and minutes
const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minutes = Array.from({ length: 60 / 5 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  // Parse the initial value when the component mounts or value changes
  useEffect(() => {
    if (value) {
      const [time, period] = value.split(" ");
      const [hour, minute] = time.split(":");
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period as "AM" | "PM");
    }
  }, [value]);

  const handleDone = () => {
    onChange(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
    setIsOpen(false);
  };

  const handleTriggerClick = () => {
    if (onOpen) {
      onOpen();
    }
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleTriggerClick}>
          <Clock className="h-4 w-4 mr-1" />
          {value ? value : "Remind me"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-2">
          <div className="flex items-center justify-center space-x-2">
            {/* Hour Picker */}
            <ScrollArea className="h-48 w-16">
              <div className="flex flex-col items-center space-y-1 p-1">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    variant={selectedHour === hour ? "default" : "ghost"}
                    className="w-full"
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Minute Picker */}
            <ScrollArea className="h-48 w-16">
              <div className="flex flex-col items-center space-y-1 p-1">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    variant={selectedMinute === minute ? "default" : "ghost"}
                    className="w-full"
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* AM/PM Picker */}
            <div className="flex flex-col space-y-1 p-1">
              <Button
                variant={selectedPeriod === "AM" ? "default" : "ghost"}
                onClick={() => setSelectedPeriod("AM")}
              >
                AM
              </Button>
              <Button
                variant={selectedPeriod === "PM" ? "default" : "ghost"}
                onClick={() => setSelectedPeriod("PM")}
              >
                PM
              </Button>
            </div>
          </div>
          <div className="pt-2 px-2">
            <Button className="w-full" onClick={handleDone}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
