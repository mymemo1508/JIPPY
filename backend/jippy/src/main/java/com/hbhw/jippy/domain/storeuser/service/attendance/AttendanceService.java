package com.hbhw.jippy.domain.storeuser.service.attendance;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.dashboard.dto.response.staff.StoreSalaryResponse;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.entity.StoreCoordinates;
import com.hbhw.jippy.domain.store.repository.StoreCoordinatesRepository;
import com.hbhw.jippy.domain.store.repository.StoreRepository;
import com.hbhw.jippy.domain.storeuser.dto.request.attendance.AttendanceRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.attendance.ChangeScheduleRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.attendance.TempChangeRequest;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.ChangeScheduleResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.CheckInResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.CheckOutResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.attendance.TempChangeResponse;
import com.hbhw.jippy.domain.storeuser.entity.attendance.ChangeSchedule;
import com.hbhw.jippy.domain.storeuser.entity.calendar.Calendar;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.entity.attendance.AttendanceStatus;
import com.hbhw.jippy.domain.storeuser.entity.attendance.EmploymentStatus;
import com.hbhw.jippy.domain.storeuser.enums.DayOfWeek;
import com.hbhw.jippy.domain.storeuser.repository.attendance.AttendanceMongoRepository;
import com.hbhw.jippy.domain.storeuser.repository.calendar.CalendarRepository;
import com.hbhw.jippy.domain.storeuser.repository.staff.StoreStaffRepository;
import com.hbhw.jippy.domain.storeuser.repository.attendance.AttendanceStatusRepository;
import com.hbhw.jippy.domain.storeuser.repository.attendance.EmploymentStatusRepository;
import com.hbhw.jippy.domain.user.entity.UserStaff;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import com.hbhw.jippy.utils.UUIDProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final StoreStaffRepository storeStaffRepository;
    private final EmploymentStatusRepository employmentStatusRepository;
    private final AttendanceStatusRepository attendanceStatusRepository;
    private final StoreRepository storeRepository;
    private final CalendarRepository calendarRepository;
    private final StoreCoordinatesRepository storeCoordinatesRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final AttendanceMongoRepository attendanceMongoRepository;
    private final UUIDProvider uuidProvider;
    private static final double EARTH_RADIUS = 6371e3; // 지구 반경 (미터 단위)
    private static final double ERROR_RANGE = 1000.0;

    private static final String TEMP_SCHEDULE_PREFIX = "temp:schedule:";

    @Transactional
    public CheckInResponse checkIn(Integer storeId, AttendanceRequest attendanceRequest) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 매장입니다."));

        StoreUserStaff staff = storeStaffRepository.findByUserStaffId(attendanceRequest.getStaffId())
                .orElseThrow(() -> new NoSuchElementException("매장 직원 정보를 찾을 수 없습니다."));

//        Optional<StoreCoordinates> storeCoordinatesOptional = storeCoordinatesRepository.findByStoreId(storeId);
//        if (!storeCoordinatesOptional.isPresent()) {
//            throw new BusinessException(CommonErrorCode.NOT_FOUND, "스토어 좌표를 찾을 수 없습니다." + " " + storeId);
//        }
//        StoreCoordinates storeCoordinates = storeCoordinatesOptional.get();
//        System.out.println(storeCoordinates.getLatitude() + " " + storeCoordinates.getLongitude());
//        System.out.println(Double.parseDouble(attendanceRequest.getLatitude()) + " " + Double.parseDouble(attendanceRequest.getLongitude()));
//        if (!isWithinRange(storeCoordinates.getLatitude(), storeCoordinates.getLongitude(),
//            Double.parseDouble(attendanceRequest.getLatitude()), Double.parseDouble(attendanceRequest.getLongitude()), ERROR_RANGE)) {
//            throw new BusinessException(CommonErrorCode.OUT_OF_RANGE, "GPS 범위를 벗어났습니다.");
//        }

        String startTime = DateTimeUtils.nowString();
//        validateCheckInTime(staff, DateTimeUtils.parseDateTime(startTime));

        Boolean isLate = checkIfLate(staff, DateTimeUtils.parseDateTime(startTime));

        EmploymentStatus status = EmploymentStatus.builder()
                .store(store)
                .storeUserStaff(staff)
                .startDate(startTime)
                .endDate("9999-12-31 23:59:59")  // 퇴근 전 임시값
                .totalWorkTime(0)                // 퇴근 전 임시값
                .isLate(isLate)
                .isEarlyLeave(false)             // 퇴근 전 기본값
                .build();

        employmentStatusRepository.save(status);

        /**
         * Redis에 실시간 출근 상태 저장
         */
        AttendanceStatus attendanceStatus = AttendanceStatus.builder()
                .id(staff.getId())
                .staffName(staff.getUserStaff().getName())
                .storeId(storeId)
                .build();

        AttendanceStatus savedStatus = attendanceStatusRepository.save(attendanceStatus);
        log.info("출근 상태 저장 완료 => id: {}, staffName: {}", savedStatus.getId(), savedStatus.getStaffName());

        return CheckInResponse.of(status);
    }

    @Transactional
    public CheckOutResponse checkOut(Integer userStaffId) {
        StoreUserStaff staff = storeStaffRepository.findByUserStaffId(userStaffId)
                .orElseThrow(() -> new NoSuchElementException("매장 직원 정보를 찾을 수 없습니다."));

        String today = DateTimeUtils.todayString();

        List<EmploymentStatus> statusList = employmentStatusRepository.findTodayAttendance(staff.getId(), today)
                .orElseThrow(() -> new NoSuchElementException("출근 기록이 없습니다."));
        EmploymentStatus status = statusList.get(0);

        String endTime = DateTimeUtils.nowString();
//        validateCheckOutTime(staff, DateTimeUtils.parseDateTime(endTime));

        Boolean isEarlyLeave = checkIfEarlyLeave(staff, DateTimeUtils.parseDateTime(endTime));
        Integer totalWorkTime = calculateTotalWorkTime(
                DateTimeUtils.parseDateTime(status.getStartDate()),
                DateTimeUtils.parseDateTime(endTime)
        );

        status.setEndDate(endTime);
        status.setIsEarlyLeave(isEarlyLeave);
        status.setTotalWorkTime(totalWorkTime);

        attendanceStatusRepository.deleteById(staff.getId());

        return CheckOutResponse.of(status);
    }

    @Transactional
    public TempChangeResponse changeTempSchedule(Integer storeId, Integer storeUserStaffId, TempChangeRequest request) {
        StoreUserStaff staff = storeStaffRepository.findById(storeUserStaffId)
                .orElseThrow(() -> new NoSuchElementException("매장 직원 정보를 찾을 수 없습니다."));

        if (!staff.getStore().getId().equals(storeId)) {
            throw new NoSuchElementException("매장을 찾을 수 없습니다.");
        }

        /**
         * Redis에 임시 스케줄 저장
         */
        String key = TEMP_SCHEDULE_PREFIX + storeUserStaffId + ":" + request.getNewDate();
        String value = request.getNewStartTime() + "|" + request.getNewEndTime();
        Duration ttl = Duration.between(LocalDateTime.now(), LocalDate.parse(request.getNewDate()).plusDays(1).atStartOfDay());
        String listKey = TEMP_SCHEDULE_PREFIX + storeId;

        if (Boolean.TRUE.equals(redisTemplate.hasKey(listKey))) {
            log.info("attendance cashe: {} → delete", listKey);
            redisTemplate.delete(listKey);
        }

        log.info(key);
        log.info(value);
        log.info(ttl.toString());

        //redisTemplate.opsForValue().set(key, value, ttl);
        attendanceMongoRepository.deleteRequestSchedule(request.getUuid());

        return TempChangeResponse.builder()
                .storeUserStaffId(storeUserStaffId)
                .newDate(request.getNewDate())
                .newStartTime(request.getNewStartTime())
                .newEndTime(request.getNewEndTime())
                .build();
    }

    /**
     * 지각 확인 메서드
     */
    private Boolean checkIfLate(StoreUserStaff staff, LocalDateTime currentTime) {
        Calendar schedule = getSchedule(staff, currentTime);
        String currentTimeStr = String.format("%02d:%02d", currentTime.getHour(), currentTime.getMinute());

        return currentTimeStr.compareTo(schedule.getStartTime()) > 0;
    }

    /**
     * 조퇴 확인 메서드
     */
    private Boolean checkIfEarlyLeave(StoreUserStaff staff, LocalDateTime currentTime) {
        Calendar schedule = getSchedule(staff, currentTime);
        String currentTimeStr = String.format("%02d:%02d", currentTime.getHour(), currentTime.getMinute());

        return currentTimeStr.compareTo(schedule.getEndTime()) < 0;
    }

    /**
     * 총 근무 시간 계산 메서드
     */
    private Integer calculateTotalWorkTime(LocalDateTime startTime, LocalDateTime endTime) {
        return (int) Duration.between(startTime, endTime).toMinutes();
    }

    /**
     * 해당 요일의 근무 스케줄 찾는 메서드
     */
    private Calendar getSchedule(StoreUserStaff staff, LocalDateTime currentTime) {
        Integer dayValue = currentTime.getDayOfWeek().getValue();
        DayOfWeek dayOfWeek = DayOfWeek.ofLegacyCode(dayValue);

        // 임시 스케줄 먼저 조회
        String key = TEMP_SCHEDULE_PREFIX + staff.getId() + ":" + currentTime.toLocalDate();
        String tempSchedule = redisTemplate.opsForValue().get(key);

        if (tempSchedule != null) {
            String[] times = tempSchedule.split("[|]");
            return Calendar.builder()
                    .storeUserStaff(staff)
                    .dayOfWeek(dayOfWeek)
                    .startTime(times[0])
                    .endTime(times[1])
                    .build();
        }

        // 기존 스케줄 반환
        return calendarRepository.findByStoreUserStaffAndDayOfWeek(staff, dayOfWeek)
                .orElseThrow(() -> new NoSuchElementException("해당 요일의 스케줄을 찾을 수 없습니다."));
    }

    public void addChangeSchedule(ChangeScheduleRequest changeScheduleRequest, Integer storeId, Integer staffId) {
        StoreUserStaff staff = storeStaffRepository.findByStoreIdAndUserStaffId(storeId, staffId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재 하지 않는 직원입니다."));

        ChangeSchedule changeSchedule = ChangeSchedule.builder()
                .newCheckOut(changeScheduleRequest.getNewCheckOut())
                .newCheckIn(changeScheduleRequest.getNewCheckIn())
                .newYear(changeScheduleRequest.getNewYear())
                .beforeCheckIn(changeScheduleRequest.getBeforeCheckIn())
                .beforeCheckOut(changeScheduleRequest.getBeforeCheckOut())
                .beforeYear(changeScheduleRequest.getBeforeYear())
                .staffId(staffId)
                .storeId(storeId)
                .acceptStatus(false)
                .uuid(uuidProvider.generateUUID())
                .build();
        attendanceMongoRepository.save(changeSchedule);
    }

    public List<ChangeScheduleResponse> fetchChangeSchedule(Integer storeId) {

        String key = TEMP_SCHEDULE_PREFIX + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if (cashJsonData != null) {
                log.info("totalStoreSalary : cash hit!!");
                return objectMapper.readValue(cashJsonData, new TypeReference<>() {
                });
            }

            List<StoreUserStaff> staffList = storeStaffRepository.findByStoreId(storeId)
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재 하지 않는 직원입니다."));
            List<ChangeScheduleResponse> response = new ArrayList<>();


            for (StoreUserStaff staff : staffList) { // 가상스레드 적용 가능
                List<ChangeSchedule> changeScheduleList = attendanceMongoRepository.getStaffChangeSchedule(storeId, staff.getId(), false)
                        .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재 하지 않는 직원입니다."));

                for (ChangeSchedule changeSchedule : changeScheduleList) {
                    ChangeScheduleResponse changeScheduleResponse = ChangeScheduleResponse.builder()
                            .uuid(changeSchedule.getUuid())
                            .staffId(changeSchedule.getStaffId())
                            .staffName(staff.getUserStaff().getName())
                            .beforeCheckIn(changeSchedule.getBeforeCheckIn())
                            .beforeCheckOut(changeSchedule.getBeforeCheckOut())
                            .beforeYear(changeSchedule.getBeforeYear())
                            .newCheckIn(changeSchedule.getNewCheckIn())
                            .newCheckOut(changeSchedule.getNewCheckOut())
                            .newYear(changeSchedule.getNewYear())
                            .build();

                    response.add(changeScheduleResponse);
                }
            }
            String jsonData = objectMapper.writeValueAsString(response); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 10));
            log.info("totalStoreSalary : db search");
            return response;
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "직원 근태 서버 에러");
        }
    }

    /**
     * 출근 가능 시간 검증 메서드
     * => 출근 10분 전부터 퇴근 이전까지 가능
     */
    private void validateCheckInTime(StoreUserStaff staff, LocalDateTime currentTime) {
        Calendar schedule = getSchedule(staff, currentTime);

        LocalTime currentTimeOfDay = currentTime.toLocalTime();
        LocalTime startTime = DateTimeUtils.parseTime(schedule.getStartTime());
        LocalTime endTime = DateTimeUtils.parseTime(schedule.getEndTime());
        LocalTime availableTime = startTime.minusMinutes(10);

        if (currentTimeOfDay.isBefore(availableTime) || currentTimeOfDay.isAfter(endTime)) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "출근 가능 시간이 아닙니다.");
        }
    }

    /**
     * 퇴근 가능 시간 검증 메서드
     * => 출근 이후부터 퇴근 10분 후까지 가능
     */
    private void validateCheckOutTime(StoreUserStaff staff, LocalDateTime currentTime) {
        Calendar schedule = getSchedule(staff, currentTime);

        LocalTime currentTimeOfDay = currentTime.toLocalTime();
        LocalTime startTime = DateTimeUtils.parseTime(schedule.getStartTime());
        LocalTime endTime = DateTimeUtils.parseTime(schedule.getEndTime());
        LocalTime availableTime = endTime.plusMinutes(10);

        if (currentTimeOfDay.isBefore(startTime) || currentTimeOfDay.isAfter(availableTime)) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE, "퇴근 가능 시간이 아닙니다.");
        }
    }

    private boolean isWithinRange(double lat1, double lon1, double lat2, double lon2, double range) {
        double latRad1 = Math.toRadians(lat1);
        double lonRad1 = Math.toRadians(lon1);
        double latRad2 = Math.toRadians(lat2);
        double lonRad2 = Math.toRadians(lon2);

        double dLat = latRad2 - latRad1;
        double dLon = lonRad2 - lonRad1;

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                Math.cos(latRad1) * Math.cos(latRad2) *
                        Math.pow(Math.sin(dLon / 2), 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (EARTH_RADIUS * c) <= range;
    }

}
