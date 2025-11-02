"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

export function TimePicker({ label = "Select Time", value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [hour, setHour] = React.useState("");
  const [minute, setMinute] = React.useState("");
  const [ampm, setAmPm] = React.useState("AM");

  // Convert selected values into time string (HH:MM AM/PM)
  React.useEffect(() => {
    if (hour && minute && ampm) {
      onChange(`${hour}:${minute} ${ampm}`);
    }
  }, [hour, minute, ampm]);

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {value || "Select time"}
            <ChevronDownIcon className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="grid grid-cols-3 gap-2">
            {/* Hour Select */}
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger>
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Minute Select */}
            <Select value={minute} onValueChange={setMinute}>
              <SelectTrigger>
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* AM/PM Select */}
            <Select value={ampm} onValueChange={setAmPm}>
              <SelectTrigger>
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
