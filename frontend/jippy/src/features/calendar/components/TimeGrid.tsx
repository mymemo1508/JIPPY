import { TimeSlot } from "../types/calendar";

interface TimeGridProps {
  timeSlots: TimeSlot[];
}

const TimeGrid = ({ timeSlots }: TimeGridProps) => {
  return (
    <div className="w-10 flex flex-col">
      {timeSlots.map((slot, index) => (
        <div key={index} className="h-10 flex item-center justify-end pr-2">
          <span className="text-xs text-gray-500 font-thin">
            {slot.time}
            {slot.format}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimeGrid;
