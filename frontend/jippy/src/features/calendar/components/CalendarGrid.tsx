import { StaffScheduleData, ScheduleEvent, TimeSlot } from "../types/calendar";
import TimeGrid from "./TimeGrid";
import ScheduleEventComponent from "./ScheduleEvent";

interface CalendarGridProps {
  days: readonly ["일", "월", "화", "수", "목", "금", "토"];
  timeSlots: TimeSlot[];
  scheduleData: StaffScheduleData | null;
  calculateEventPosition: (hour: number) => number;
}

const CalendarGrid = ({
  days,
  timeSlots,
  scheduleData,
  calculateEventPosition,
}: CalendarGridProps) => {
  return (
    <div className="px-4 pb-4">
      <div className="flex">
        <TimeGrid timeSlots={timeSlots} />
        {days.map((day) => (
          <div key={day} className="flex-1 relative">
            {timeSlots.map((_, index) => (
              <div key={index} className="h-10 border-b bg-white" />
            ))}

            {scheduleData?.schedules
              .filter((schedule) => schedule.dayOfWeek === day)
              .map((schedule) => {
                // 시간을 픽셀 위치로 변환
                const startHour = parseInt(schedule.startTime.split(":")[0]);
                const endHour = parseInt(schedule.endTime.split(":")[0]);
                const top = calculateEventPosition(startHour);
                const height =
                  endHour === 0
                    ? (24 - startHour) * 40
                    : (endHour - startHour) * 40;

                const event: ScheduleEvent = {
                  id: schedule.calendarId,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                  dayOfWeek: schedule.dayOfWeek,
                  height,
                  top,
                };

                return (
                  <ScheduleEventComponent
                    key={schedule.calendarId}
                    event={event}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
