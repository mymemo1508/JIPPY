package com.hbhw.jippy.domain.ocr.dto.request;

import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
public class OcrRequest {
    private MultipartFile document;
}