package com.hbhw.jippy.domain.ocr.controller;

import com.hbhw.jippy.domain.ocr.dto.response.OcrExtractedData;
import com.hbhw.jippy.domain.ocr.service.OcrService;
import com.hbhw.jippy.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final OcrService ocrService;

    @PostMapping
    public ApiResponse<OcrExtractedData> performOcr(@RequestParam("document") MultipartFile image) {
        OcrExtractedData extractedData = ocrService.performOcr(image);
        return ApiResponse.success(extractedData);
    }

}
