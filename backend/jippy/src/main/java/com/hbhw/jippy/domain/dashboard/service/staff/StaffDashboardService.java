package com.hbhw.jippy.domain.dashboard.service.staff;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.dashboard.dto.response.staff.*;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.repository.StoreRepository;
import com.hbhw.jippy.domain.storeuser.entity.attendance.AttendanceStatus;
import com.hbhw.jippy.domain.storeuser.entity.attendance.EmploymentStatus;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.enums.StaffSalaryType;
import com.hbhw.jippy.domain.storeuser.repository.attendance.AttendanceStatusRepository;
import com.hbhw.jippy.domain.storeuser.repository.attendance.EmploymentStatusRepository;
import com.hbhw.jippy.domain.storeuser.repository.staff.StoreStaffRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffDashboardService {
    private final StoreRepository storeRepository;
    private final AttendanceStatusRepository attendanceStatusRepository;
    private final StoreStaffRepository storeStaffRepository;
    private final EmploymentStatusRepository employmentStatusRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "staffDashboard";

    public WorkingStaffResponse getWorkingStaff(Integer storeId) {
        Store store = validateStore(storeId);

        // Redis에서 현재 출근 중인 직원 불러오기
        List<AttendanceStatus> nowAttendances = attendanceStatusRepository.findByStoreId(storeId);

        List<StaffInfoResponse> staffList = nowAttendances.stream()
                .map(attendance -> {
                    StoreUserStaff staff = storeStaffRepository.findById(attendance.getId())
                            .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "직원 정보를 찾을 수 없습니다."));

                    return StaffInfoResponse.builder()
                            .staffId(staff.getId())
                            .name(staff.getUserStaff().getName())
                            .build();
                })
                .toList();

        return WorkingStaffResponse.builder()
                .totalCount(staffList.size())
                .staffList(staffList)
                .build();
    }

    public StaffStatusResponse getStaffStatus(Integer storeId, Integer staffId, String date) {
        StoreUserStaff staff = validateStoreAndStaff(storeId, staffId);

        String startOfMonth = DateTimeUtils.getStartOfMonth(date);
        String endOfMonth = DateTimeUtils.getEndOfMonth(date);

        List<EmploymentStatus> monthlyWork = validateEmploymentStatus(staff, startOfMonth, endOfMonth);

        // 근태 정보 계산
        int workMinutes = monthlyWork.stream()
                .mapToInt(EmploymentStatus::getTotalWorkTime)
                .sum();

        int lateCount = (int) monthlyWork.stream()
                .filter(EmploymentStatus::getIsLate)
                .count();

        int earlyLeaveCount = (int) monthlyWork.stream()
                .filter(EmploymentStatus::getIsEarlyLeave)
                .count();

        int salary = calculateSalary(staff, workMinutes);

        return StaffStatusResponse.builder()
                .staffId(staffId)
                .salary(salary)
                .lateCount(lateCount)
                .earlyLeaveCount(earlyLeaveCount)
                .workMinutes(workMinutes)
                .build();
    }

    public TotalStaffStatusResponse getTotalStaffStatus(Integer storeId, Integer staffId) {
        StoreUserStaff staff = validateStoreAndStaff(storeId, staffId);

        List<EmploymentStatus> totalWork = employmentStatusRepository.findByStoreUserStaff(staff);

        if (totalWork.isEmpty()) {
            throw new BusinessException(CommonErrorCode.NOT_FOUND, "해당 직원의 근무 기록이 없습니다.");
        }

        // 누적 근태 정보 계산
        int totalWorkMinutes = totalWork.stream()
                .mapToInt(EmploymentStatus::getTotalWorkTime)
                .sum();

        int totalLateCount = (int) totalWork.stream()
                .filter(EmploymentStatus::getIsLate)
                .count();

        int totalEarlyLeaveCount = (int) totalWork.stream()
                .filter(EmploymentStatus::getIsEarlyLeave)
                .count();

        int totalSalary;
        if (staff.getStaffSalaryType() == StaffSalaryType.월급) {
            String firstWorkDate = totalWork.stream()
                    .min(Comparator.comparing(EmploymentStatus::getStartDate))
                    .map(EmploymentStatus::getStartDate)
                    .orElse(DateTimeUtils.nowString());

            String endWorkDate = totalWork.stream()
                    .max(Comparator.comparing(EmploymentStatus::getStartDate))
                    .map(EmploymentStatus::getStartDate)
                    .orElse(DateTimeUtils.nowString());

            LocalDate startMonth = LocalDate.parse(firstWorkDate.substring(0, 10)).withDayOfMonth(1);
            LocalDate endMonth = LocalDate.parse(endWorkDate.substring(0, 10)).withDayOfMonth(1);

            int monthCount = (int) ChronoUnit.MONTHS.between(startMonth, endMonth) + 1;

            totalSalary = staff.getStaffSalary() * monthCount;
        } else {
            totalSalary = (int) (totalWorkMinutes / 60.0) * staff.getStaffSalary();
        }

        return TotalStaffStatusResponse.builder()
                .staffId(staffId)
                .totalSalary(totalSalary)
                .totalLateCount(totalLateCount)
                .totalEarlyLeaveCount(totalEarlyLeaveCount)
                .totalWorkMinutes(totalWorkMinutes)
                .build();
    }

    public StoreSalaryResponse getStoreSalary(Integer storeId, String date) {
        Store store = validateStore(storeId);
        String key = CACHE_PREFIX + storeId + date;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if (cashJsonData != null) {
                log.info("totalStoreSalary : cash hit!!");
                return objectMapper.readValue(cashJsonData, StoreSalaryResponse.class);
            }

            String startOfMonth = DateTimeUtils.getStartOfMonth(date);
            String endOfMonth = DateTimeUtils.getEndOfMonth(date);

            Integer hourlyStaffSalary = calculateHourlyStaffSalary(storeId, startOfMonth, endOfMonth);
            Integer monthlyStaffSalary = calculateMonthlyStaffSalary(storeId, startOfMonth, endOfMonth);
            StoreSalaryResponse storeSalaryResponse = StoreSalaryResponse.builder()
                    .storeSalary(hourlyStaffSalary + monthlyStaffSalary)
                    .build();

            String jsonData = objectMapper.writeValueAsString(storeSalaryResponse); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 60));
            log.info("totalStoreSalary : db search");
            return storeSalaryResponse;
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 도메인 서버에러 발생");
        }
    }

    public TotalStoreSalaryResponse getTotalStoreSalary(Integer storeId) {
        storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 매장입니다."));

        String key = CACHE_PREFIX + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if (StringUtils.hasText(cashJsonData)) {
                log.info("totalStoreSalary : cash hit!!");
                return objectMapper.readValue(cashJsonData, TotalStoreSalaryResponse.class);
            }

            List<EmploymentStatus> totalWork = employmentStatusRepository.findByStoreId(storeId);


            if (totalWork.isEmpty()) {
                throw new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장의 근무 기록이 없습니다.");
            }

            String firstWorkDate = totalWork.stream()
                    .min(Comparator.comparing(EmploymentStatus::getStartDate))
                    .map(EmploymentStatus::getStartDate)
                    .orElse(DateTimeUtils.nowString());

            String endWorkDate = totalWork.stream()
                    .max(Comparator.comparing(EmploymentStatus::getStartDate))
                    .map(EmploymentStatus::getStartDate)
                    .orElse(DateTimeUtils.nowString());

            Integer totalHourlySalary = calculateHourlyStaffSalary(storeId, firstWorkDate, endWorkDate);
            Integer totalMonthlySalary = calculateMonthlyStaffSalary(storeId, firstWorkDate, endWorkDate);

            TotalStoreSalaryResponse response = TotalStoreSalaryResponse.builder()
                    .totalStoreSalary(totalHourlySalary + totalMonthlySalary)
                    .build();

            String jsonData = objectMapper.writeValueAsString(response); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 60));
            log.info("totalStoreSalary : db search");
            return response;
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 도메인 서버에러 발생");
        }
    }

    /**
     * 매장 검증 메서드
     */
    private Store validateStore(Integer storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 매장입니다."));
    }

    /**
     * 매장과 직원 정보 검증 메서드
     */
    private StoreUserStaff validateStoreAndStaff(Integer storeId, Integer staffId) {
        Store store = validateStore(storeId);

        StoreUserStaff staff = storeStaffRepository.findById(staffId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "직원 정보를 찾을 수 없습니다."));

        if (!staff.getStore().getId().equals(storeId)) {
            throw new BusinessException(CommonErrorCode.BAD_REQUEST, "해당 매장의 직원이 아닙니다.");
        }

        return staff;
    }

    /**
     * 근무 기록 검증 메서드
     */
    private List<EmploymentStatus> validateEmploymentStatus(StoreUserStaff staff, String startDate, String endDate) {
        List<EmploymentStatus> workHistory = employmentStatusRepository
                .findByStoreUserStaffAndStartDateBetween(staff, startDate, endDate);

        if (workHistory.isEmpty()) {
            throw new BusinessException(CommonErrorCode.NOT_FOUND, "해당 기간의 근무 기록이 없습니다.");
        }

        return workHistory;
    }

    /**
     * 급여 계산 메서드
     */
    private int calculateSalary(StoreUserStaff staff, int workMinutes) {
        if (staff.getStaffSalaryType() == StaffSalaryType.월급) {
            return staff.getStaffSalary();
        }

        return (int) (workMinutes / 60.0) * staff.getStaffSalary();
    }

    /**
     * 시급 직원 누적 급여 계산 메서드
     */
    private Integer calculateHourlyStaffSalary(Integer storeId, String startDate, String endDate) {
        List<StoreUserStaff> hourlyStaff = storeStaffRepository
                .findByStoreIdAndStaffSalaryType(storeId, StaffSalaryType.시급);

        Map<Integer, Integer> workMinutes = employmentStatusRepository
                .findTotalWorkTimesByStoreIdAndStaffIdsAndDateBetween(
                        storeId,
                        hourlyStaff.stream().map(StoreUserStaff::getId).toList(),
                        startDate,
                        endDate
                )
                .stream()
                .collect(Collectors.toMap(
                        map -> ((Number) map.get("staffId")).intValue(),
                        map -> ((Number) map.get("totalMinutes")).intValue()
                ));

        return hourlyStaff.stream()
                .mapToInt(staff -> {
                    int minutes = workMinutes.getOrDefault(staff.getId(), 0);
                    return (int) (minutes / 60.0) * staff.getStaffSalary();
                })
                .sum();
    }

    /**
     * 월급 직원 누적 급여 계산 메서드
     */
    private Integer calculateMonthlyStaffSalary(Integer storeId, String startDate, String endDate) {
        List<StoreUserStaff> monthlyStaff = storeStaffRepository
                .findByStoreIdAndStaffSalaryType(storeId, StaffSalaryType.월급);

        return monthlyStaff.stream()
                .filter(staff -> !employmentStatusRepository
                        .findByStoreUserStaffAndStartDateBetween(staff, startDate, endDate)
                        .isEmpty())
                .mapToInt(staff -> {
                    List<EmploymentStatus> works = employmentStatusRepository
                            .findByStoreUserStaffAndStartDateBetween(staff, startDate, endDate);

                    if (works.isEmpty()) {
                        return 0;
                    }

                    // 실제 근무한 달만 추출
                    Set<String> workedMonths = works.stream()
                            .map(record -> record.getStartDate().substring(0, 7))
                            .collect(Collectors.toSet());

                    return staff.getStaffSalary() * workedMonths.size();
                })
                .sum();
    }
}
