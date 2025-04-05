package com.hbhw.jippy.utils;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DateTimeUtils {

    /**
     *  유틸 클래스이므로 인스턴스 생성 방지
     */
    private DateTimeUtils() {
    }

    /**
     * 현재 시간("yyyy-MM-dd HH:mm:ss") 문자열 반환
     */
    public static String nowString() {
        return LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    /**
     * 현재 날짜("yyyy-MM-dd") 문자열 반환
     */
    public static String todayString() {
        return LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    /**
     * 문자열을 LocalDateTime으로 변환
     */
    public static LocalDateTime parseDateTime(String dateTimestr) {
        return LocalDateTime.parse(dateTimestr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    /**
     * 문자열을 LocalTime으로 변환
     */
    public static LocalTime parseTime(String timeStr) {
        return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
    }

    /**
     * 해당 월의 시작 시점으로 변환
     */
    public static String getStartOfMonth(String yearMonth) {
        return yearMonth + "-01 00:00:00";
    }

    /**
     * 해당 월의 마지막 시점으로 변환
     */
    public static String getEndOfMonth(String yearMonth) {
        LocalDateTime startDateTime = parseDateTime(getStartOfMonth(yearMonth));
        return startDateTime
                .withDayOfMonth(startDateTime.toLocalDate().lengthOfMonth())
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " 23:59:59";
    }

    /**
     * Jwt 생성 시간용 메서드
     */
    public static Date now() {
        return new Date();
    }

    /**
     * Jwt 만료 시간용 메서드
     */
    public static Date getExpirationTime(long expirationMillis) {
        return new Date(now().getTime() + expirationMillis);
    }

    /**
     * 원하는 시간/포맷에 대한 메서드를 더 만들 수도 있습니다
     */
    public static String convertDateFormat(String raw) {
        Pattern p = Pattern.compile("(\\d{4})\\s*년\\s*(\\d{1,2})\\s*월\\s*(\\d{1,2})\\s*일");
        Matcher m = p.matcher(raw);
        if (m.find()) {
            String year  = m.group(1);
            int month    = Integer.parseInt(m.group(2));
            int day      = Integer.parseInt(m.group(3));
            return String.format("%s-%02d-%02d 00:00:00", year, month, day);
        }
        return null;
    }
}
