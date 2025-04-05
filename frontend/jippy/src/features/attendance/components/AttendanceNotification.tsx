import React from "react";
import { Check } from "lucide-react";
import { AttendanceStatus } from "../types/attendance";
import styles from "../styles/AttendanceNotification.module.css";

interface AttendanceNotificationProps {
  status: Exclude<AttendanceStatus, "NONE">;
  time: string;
  onConfirm?: () => void;
}

const AttendanceNotification: React.FC<AttendanceNotificationProps> = ({
  status,
  time,
  onConfirm = () => {},
}) => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);

  const statusMessage = {
    CHECKED_IN: "정상 출근 되었습니다!",
    CHECKED_OUT: "정상 퇴근 되었습니다!",
  }[status];

  return (
    <div className={styles.container}>
      <div className={styles.notificationBox}>
        <div className={styles.notificationContent}>
          <div className={styles.dateTimeContainer}>
            <h2 className={styles.dateText}>{formattedDate}</h2>
            <h3 className={styles.timeText}>{time}</h3>
            <h3 className={styles.messageText}>{statusMessage}</h3>
          </div>

          <div className={styles.checkIconWrapper}>
            <div className={styles.checkIconCircle}>
              <div className={styles.checkIconInner}>
                <Check
                  size={30}
                  className="text-[#F27B39]"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <button onClick={onConfirm} className={styles.confirmButton}>
            <span className={styles.confirmButtonText}>확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceNotification;
