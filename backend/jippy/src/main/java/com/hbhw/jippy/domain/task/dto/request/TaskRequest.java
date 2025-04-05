package com.hbhw.jippy.domain.task.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskRequest {
    private String title;         // 할 일 제목
    private boolean isComplete;   // 완료 여부
}
