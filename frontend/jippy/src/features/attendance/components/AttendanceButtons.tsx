import React, { useState, useEffect } from "react";
import AttendanceNotification from "./AttendanceNotification";
import { AttendanceStatus } from "../types/attendance";
import styles from "../styles/AttendanceButtons.module.css";
import useWorkingStatus from "../hooks/useWorkingStatus";
import LoadingSpinner from "@/features/common/components/ui/LoadingSpinner";
import useAttendanceAction from "../hooks/useAttendanceAction";

interface AttendanceButtonsProps {
  className?: string;
  storeId: number;
  staffId: number;
}

const AttendanceButtons: React.FC<AttendanceButtonsProps> = ({
  className = "",
  storeId,
  staffId,
}) => {
  const [status, setStatus] = useState<AttendanceStatus>("NONE");
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const { isWorking, isLoading, refreshStatus } = useWorkingStatus(
    storeId,
    staffId
  );
  const {
    checkIn,
    checkOut,
    isLoading: actionLoading,
  } = useAttendanceAction(storeId);

  useEffect(() => {
    const savedDate = localStorage.getItem("attendanceDate");
    const today = new Date().toDateString();

    if (savedDate !== today) {
      localStorage.removeItem("attendanceStatus");
      localStorage.removeItem("checkInTime");
      localStorage.removeItem("checkOutTime");
    } else {
      const savedStatus = localStorage.getItem(
        "attendanceStatus"
      ) as AttendanceStatus;
      const savedCheckInTime = localStorage.getItem("checkInTime");
      const savedCheckOutTime = localStorage.getItem("checkOutTime");

      if (savedStatus) setStatus(savedStatus);
      if (savedCheckInTime) setCheckInTime(savedCheckInTime);
      if (savedCheckOutTime) setCheckOutTime(savedCheckOutTime);
    }
    localStorage.setItem("attendanceDate", today);
  }, []);

  useEffect(() => {
    if (status !== "NONE") {
      localStorage.setItem("attendanceStatus", status);
    } else {
      localStorage.removeItem("attendanceStatus");
    }
  }, [status]);

  useEffect(() => {
    if (checkInTime) {
      localStorage.setItem("checkInTime", checkInTime);
    }
  }, [checkInTime]);

  useEffect(() => {
    if (checkOutTime) {
      localStorage.setItem("checkOutTime", checkOutTime);
    }
  }, [checkOutTime]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    if (!isLoading) {
      const savedStatus = localStorage.getItem(
        "attendanceStatus"
      ) as AttendanceStatus;
      if (savedStatus === "CHECKED_OUT") {
        setStatus("CHECKED_OUT");
      } else {
        setStatus(isWorking ? "CHECKED_IN" : "NONE");
      }
    }
  }, [isWorking, isLoading]);

  const handleCheckIn = async () => {
    try {
      const result = await checkIn();
      setCheckInTime(formatTime(result.checkInTime));
      setStatus("CHECKED_IN");
      setShowNotification(true);
      await refreshStatus();
    } catch (error) {
      console.error("출근 처리 실패: ", error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const result = await checkOut();
      setCheckOutTime(formatTime(result.checkOutTime));
      setStatus("CHECKED_OUT");
      setShowNotification(true);
      await refreshStatus();
    } catch (error) {
      console.error("퇴근 처리 실패:", error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      {showNotification && status != "NONE" && (
        <AttendanceNotification
          status={status}
          time={status === "CHECKED_IN" ? checkInTime : checkOutTime}
          onConfirm={() => setShowNotification(false)}
        />
      )}

      <div className={`${styles.container} ${className}`}>
        <button
          onClick={handleCheckIn}
          disabled={status !== "NONE" || actionLoading}
          className={`${styles.button} ${styles.checkInButton} 
            ${status !== "NONE" ? styles.checkInButtonDisabled : ""}`}
          type="button"
        >
          {checkInTime ? (
            <>
              <span className={styles.buttonTimeText}>{checkInTime}</span>
              <span className={styles.buttonStatusText}>출근 완료</span>
            </>
          ) : (
            <span className={styles.buttonDefaultText}>
              {actionLoading ? "처리중..." : "출근하기"}
            </span>
          )}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={status !== "CHECKED_IN" || actionLoading}
          className={`${styles.button} ${styles.checkOutButton}
            ${status !== "CHECKED_IN" ? styles.checkOutButtonDisabled : ""}`}
          type="button"
        >
          {checkOutTime ? (
            <>
              <span className={styles.buttonTimeText}>{checkOutTime}</span>
              <span className={styles.buttonStatusText}>퇴근 완료</span>
            </>
          ) : (
            <span className={styles.buttonDefaultText}>
              {actionLoading ? "처리중..." : "퇴근하기"}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default AttendanceButtons;
