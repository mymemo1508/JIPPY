package com.hbhw.jippy.domain.task.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private Long id;
    private Integer storeId;
    private String title;
    private String createdAt;
    private boolean isComplete;
}
