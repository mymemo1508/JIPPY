package com.hbhw.jippy.domain.storeuser.service.calendar;

import com.hbhw.jippy.domain.storeuser.dto.request.calendar.WeekScheduleRequest;
import com.hbhw.jippy.domain.storeuser.dto.request.calendar.DayScheduleRequest;
import com.hbhw.jippy.domain.storeuser.dto.response.calendar.ScheduleResponse;
import com.hbhw.jippy.domain.storeuser.dto.response.calendar.StaffScheduleResponse;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.entity.calendar.Calendar;
import com.hbhw.jippy.domain.storeuser.repository.staff.StoreStaffRepository;
import com.hbhw.jippy.domain.storeuser.repository.calendar.CalendarRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {
    private final StoreStaffRepository storeStaffRepository;
    private final CalendarRepository calendarRepository;

    @Transactional
    public void createSchedule(Integer storeId, Integer staffId, WeekScheduleRequest request) {
        StoreUserStaff staff = storeStaffRepository.findById(staffId)
                .orElseThrow(() -> new NoSuchElementException("매장의 직원 정보를 찾을 수 없습니다."));

        if (!staff.getStore().getId().equals(storeId)) {
            throw new NoSuchElementException("매장을 찾을 수 없습니다.");
        }

        for (DayScheduleRequest schedule : request.getSchedules()) {
            if (calendarRepository.findByStoreUserStaffAndDayOfWeek(staff, schedule.getDayOfWeek()).isPresent()) {
                throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE,
                        schedule.getDayOfWeek() + "요일에 이미 스케줄이 존재합니다.");
            }
        }

        List<Calendar> calendars = request.getSchedules().stream()
                        .map(schedule -> {
                            return Calendar.builder()
                                    .storeUserStaff(staff)
                                    .dayOfWeek(schedule.getDayOfWeek())
                                    .startTime(schedule.getStartTime())
                                    .endTime(schedule.getEndTime())
                                    .build();
                        })
                                .collect(Collectors.toList());

        calendarRepository.saveAll(calendars);
    }

    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getScheduleList(Integer storeId) {
        List<Calendar> calendars = calendarRepository.findAllByStoreId(storeId);

        if (calendars.isEmpty()) {
            throw new BusinessException(CommonErrorCode.NOT_FOUND, "등록된 스케줄이 없습니다.");
        }

        Map<Integer, List<Calendar>> groupedSchedules = calendars.stream()
                .collect(Collectors.groupingBy(
                        calendar -> calendar.getStoreUserStaff().getId()
                ));



        return groupedSchedules.entrySet().stream()
                .map(entry -> {
                    List<Calendar> staffCalendars = entry.getValue();
                    Integer staffId = staffCalendars.getFirst().getStoreUserStaff().getUserStaff().getId();
                    String staffName = staffCalendars.getFirst().getStoreUserStaff().getUserStaff().getName();

                    List<ScheduleResponse> schedules = staffCalendars.stream()
                            .map(ScheduleResponse::new)
                            .collect(Collectors.toList());

                    return new StaffScheduleResponse(staffId, staffName, schedules);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffScheduleResponse getSchedule(Integer storeId, Integer staffId) {
        List<StoreUserStaff> storeUserStaffList = storeStaffRepository.findAllByUserStaffId(staffId)
                .orElseThrow(() -> new NoSuchElementException("매장의 직원 정보를 찾을 수 없습니다."));
        StoreUserStaff staff = storeUserStaffList.getFirst();
        if (!staff.getStore().getId().equals(storeId)) {
            throw new NoSuchElementException("매장을 찾을 수 없습니다.");
        }

        List<Calendar> calendars = calendarRepository.findByStoreUserStaff(staff);

        if (calendars.isEmpty()) {
            throw new BusinessException(CommonErrorCode.NOT_FOUND, "해당 직원의 스케줄 정보를 찾을 수 없습니다.");
        }

        String staffName = calendars.getFirst().getStoreUserStaff().getUserStaff().getName();

        List<ScheduleResponse> schedules = calendars.stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());

        return new StaffScheduleResponse(staffId, staffName, schedules);
    }

    @Transactional
    public ScheduleResponse updateSchedule(Integer storeId, Integer calendarId, DayScheduleRequest request) {
        Calendar calendar = calendarRepository.findById(calendarId)
                .orElseThrow(() -> new NoSuchElementException("스케줄을 찾을 수 없습니다."));

        if (!calendar.getStoreUserStaff().getStore().getId().equals(storeId)) {
            throw new NoSuchElementException("매장을 찾을 수 없습니다.");
        }

        if (!calendar.getDayOfWeek().equals(request.getDayOfWeek())) {
            if (calendarRepository.findByStoreUserStaffAndDayOfWeek(calendar.getStoreUserStaff(), request.getDayOfWeek()).isPresent()) {
                throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE,
                        request.getDayOfWeek() + "요일에 이미 스케줄이 존재합니다.");
            }
        }

        calendar.setDayOfWeek(request.getDayOfWeek());
        calendar.setStartTime(request.getStartTime());
        calendar.setEndTime(request.getEndTime());

        return new ScheduleResponse(calendar);
    }

    @Transactional
    public void deleteSchedule(Integer storeId, Integer calendarId) {
        Calendar calendar = calendarRepository.findById(calendarId)
                .orElseThrow(() -> new NoSuchElementException("스케줄을 찾을 수 없습니다."));

        if (!calendar.getStoreUserStaff().getStore().getId().equals(storeId)) {
            throw new NoSuchElementException("매장을 찾을 수 없습니다.");
        }

        calendarRepository.delete(calendar);
    }
}
