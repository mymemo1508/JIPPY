package com.hbhw.jippy.domain.storeuser.entity.calendar;

import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import com.hbhw.jippy.domain.storeuser.enums.DayOfWeek;
import com.hbhw.jippy.utils.converter.DayOfWeekConverter;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "calender")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Calendar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_user_staff_id", nullable = false)
    private StoreUserStaff storeUserStaff;

    @Column(name = "day_of_week")
    @Convert(converter = DayOfWeekConverter.class)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 20)
    private String endTime;
}
