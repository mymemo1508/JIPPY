package com.hbhw.jippy.domain.storeuser.entity.attendance;

import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.storeuser.entity.staff.StoreUserStaff;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employment_status")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EmploymentStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_user_staff_id", nullable = false)
    private StoreUserStaff storeUserStaff;

    @Column(name = "start_date", nullable = false, length = 20)
    private String startDate;

    @Column(name = "end_date", nullable = false, length = 20)
    private String endDate;

    @Column(name = "total_work_time", nullable = false)
    private Integer totalWorkTime;

    @Column(name = "is_late", nullable = false)
    private Boolean isLate;

    @Column(name = "is_early_leave", nullable = false)
    private Boolean isEarlyLeave;
}
