import { DAYS_OF_WEEK } from "../types/calendar";

const CalendarHeader = () => {
  return (
    <div className={"flex sticky top-0 bg-[#f6f6f6] z-10 px-4 py-2"}>
      <div className="w-10" />
      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day}
          className="flex-1 text-center text-sm font-normal"
          style={{
            color:
              day === "일" ? "#FF0000" : day === "토" ? "#0000FF" : "#000000",
          }}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarHeader;
