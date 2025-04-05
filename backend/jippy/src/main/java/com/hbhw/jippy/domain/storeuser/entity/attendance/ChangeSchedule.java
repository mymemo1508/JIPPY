package com.hbhw.jippy.domain.storeuser.entity.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "request_change_schedule")
@Builder
@Getter
@Setter
@AllArgsConstructor
public class ChangeSchedule {

    @Indexed(unique = true)
    @Field("UUID")
    private String uuid;

    @Field("store_id")
    private Integer storeId;

    @Field("staff_id")
    private Integer staffId;

    @Field("before_year")
    private String beforeYear;

    @Field("before_checkin")
    private String beforeCheckIn;

    @Field("before_checkout")
    private String beforeCheckOut;

    @Field("new_year")
    private String newYear;

    @Field("new_checkin")
    private String newCheckIn;

    @Field("new_checkout")
    private String newCheckOut;

    @Field("accept_status")
    private boolean acceptStatus;
}
