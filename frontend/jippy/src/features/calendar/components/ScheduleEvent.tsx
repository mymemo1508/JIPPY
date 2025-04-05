import { ScheduleEvent as ScheduleEventType } from "../types/calendar";

interface ScheduleEventProps {
  event: ScheduleEventType;
}

const ScheduleEventComponent = ({ event }: ScheduleEventProps) => {
  return (
    <div
      className="absolute w-full bg-yellow-100 rounded p-1 border border-orange-200"
      style={{
        top: `${event.top}px`,
        height: `${event.height}px`,
      }}
    >
      <div className="text-[9px] font-thin">
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
};

export default ScheduleEventComponent;
