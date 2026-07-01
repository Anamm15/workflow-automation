import { PREFIX_DAYS, MONTHS } from "@/helper/constant";
import { getDaysInMonth, isSameDate, isToday } from "@/helper/datetime";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./Modal";

type CalendarProps = {
  currentDate: string;
  setCurrentDate: React.Dispatch<React.SetStateAction<string>>;
  setIsCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  threshold?: number;
};

const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function Calendar({
  currentDate,
  setCurrentDate,
  setIsCalendarOpen,
  threshold,
}: CalendarProps) {
  const dateObj = new Date(currentDate);

  // 1. Normalize "Today" to 00:00:00 for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Calculate the maximum allowed date if a threshold is provided
  const maxDate = new Date(today);
  if (threshold !== undefined) {
    maxDate.setDate(today.getDate() + threshold);
  }

  const handleChangeMonth = (step: number) => {
    const newDate = new Date(dateObj);
    newDate.setMonth(newDate.getMonth() + step);
    setCurrentDate(formatDate(newDate));
  };

  return (
    <Modal open={true} setIsOpen={setIsCalendarOpen}>
      <ModalHeader>
        <ModalTitle>Select Date</ModalTitle>
      </ModalHeader>

      <ModalBody>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-stone-800">
              {MONTHS[dateObj.getMonth()]}
            </h2>
            <p className="text-stone-500 font-medium">
              {dateObj.getFullYear()}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleChangeMonth(-1)}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <button
              onClick={() => handleChangeMonth(1)}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
          {PREFIX_DAYS.map((day) => (
            <div
              key={day}
              className="text-xs font-bold text-stone-400 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}

          {getDaysInMonth(dateObj).map((d, idx) => {
            if (!d) return <div key={`empty-${idx}`}></div>;

            const isSelected = isSameDate(d, dateObj);
            const isTodayDate = isToday(d);

            let isDisabled = false;

            // If threshold is provided, then apply the following rules:
            // 1. don't allow past dates
            // 2. don't allow dates beyond the threshold
            if (threshold !== undefined) {
              const isPast = d < today;
              const isBeyondThreshold = d > maxDate;
              isDisabled = isPast || isBeyondThreshold;
            }
            // If threshold is not provided, then allow all dates

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  setCurrentDate(formatDate(d));
                  setIsCalendarOpen(false);
                }}
                className={`relative h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
               ${
                 isSelected
                   ? "bg-stone-900 text-white shadow-lg shadow-stone-900/30 scale-110"
                   : isDisabled
                     ? "text-stone-300 cursor-not-allowed bg-stone-50"
                     : "text-stone-700 hover:bg-teal-50 hover:text-teal-600"
               }
               ${
                 isTodayDate && !isSelected && !isDisabled
                   ? "text-teal-600 bg-teal-50 ring-1 ring-teal-200"
                   : ""
               }
               `}
              >
                {d.getDate()}
                {d.getDate() % 2 === 0 && !isSelected && !isDisabled && (
                  <span className="absolute bottom-1 w-1 h-1 bg-rose-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={() => {
            setCurrentDate(formatDate(new Date()));
            setIsCalendarOpen(false);
          }}
          className="w-full py-3 mt-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl transition-colors text-sm"
        >
          Back to today
        </button>
      </ModalFooter>
    </Modal>
  );
}
