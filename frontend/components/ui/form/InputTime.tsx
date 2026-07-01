"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

export interface TimeInputProps {
  value?: string; // HH:mm
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

function TimeColumn({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 40;

  // Sync scroll ONLY for this column
  React.useEffect(() => {
    if (!ref.current) return;
    const index = items.indexOf(value);
    if (index === -1) return;

    ref.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "auto",
    });
  }, [value, items]);

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* Column label */}
      <div className="py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-sidebar-fg">
        {label}
      </div>

      {/* Scroll wheel */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ paddingBlock: "96px" }}
      >
        {items.map((item) => {
          const active = item === value;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={cn(
                "snap-center h-10 w-full flex items-center justify-center transition-all",
                active
                  ? "text-primary font-semibold scale-110"
                  : "text-sidebar-fg hover:text-foreground",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute top-8 inset-x-0 h-10 bg-linear-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}

export function TimeInput({
  value,
  onChange,
  disabled,
  className,
}: TimeInputProps) {
  const [open, setOpen] = React.useState(false);

  /**
   * Draft state (modal only)
   */
  const [draftHour, setDraftHour] = React.useState("00");
  const [draftMinute, setDraftMinute] = React.useState("00");

  /**
   * Initialize draft ONLY when modal opens
   */
  React.useEffect(() => {
    if (!open) return;

    if (value?.includes(":")) {
      const [h, m] = value.split(":");
      setDraftHour(h);
      setDraftMinute(m);
    } else {
      const now = new Date();
      setDraftHour(String(now.getHours()).padStart(2, "0"));
      setDraftMinute(String(now.getMinutes()).padStart(2, "0"));
    }
  }, [open, value]);

  const handleSave = () => {
    onChange(`${draftHour}:${draftMinute}`);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border",
          "border-sidebar-border bg-background px-3 py-2",
          "text-sm font-mono tracking-wider",
          "hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      >
        <span className="text-foreground">{value || "--:--"}</span>
        <Clock className="h-4 w-4 text-sidebar-fg" />
      </button>

      {/* Modal */}
      <Modal open={open} setIsOpen={setOpen} maxWidth="max-w-sm">
        <ModalHeader>
          <ModalTitle>Set Time</ModalTitle>
        </ModalHeader>

        <ModalBody>
          {/* Big Display */}
          <div className="flex justify-center py-4 border-b border-sidebar-border">
            <div className="font-mono text-4xl font-bold tracking-widest text-foreground">
              {draftHour}
              <span className="mx-1 text-sidebar-fg">:</span>
              {draftMinute}
            </div>
          </div>

          {/* Picker */}
          {/* SCROLL AREA */}
          <div className="relative grid grid-cols-2 h-64">
            {/* Highlight bar */}

            <TimeColumn
              label="Hours"
              items={HOURS}
              value={draftHour}
              onChange={setDraftHour}
            />

            <TimeColumn
              label="Minutes"
              items={MINUTES}
              value={draftMinute}
              onChange={setDraftMinute}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-sidebar-fg hover:bg-sidebar-border rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium rounded-md bg-primary text-primary-fg hover:bg-primary-hover"
          >
            Save
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
