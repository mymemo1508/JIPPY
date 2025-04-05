package com.hbhw.jippy.domain.product.controller;

import com.hbhw.jippy.domain.product.dto.request.*;
import com.hbhw.jippy.domain.product.dto.response.SetMenuInfoResponse;
import com.hbhw.jippy.domain.product.service.SetMenuService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/set-menu")
public class SetMenuController {

    private final SetMenuService setMenuService;

    @Operation(summary = "세트메뉴 생성", description = "세트메뉴를 생성합니다.")
    @PostMapping("/create")
    public ApiResponse<?> createSetMenu(@RequestBody CreateSetMenuRequest createSetMenuRequest) {
        setMenuService.createSetMenu(createSetMenuRequest);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    @Operation(summary = "세트메뉴 삭제", description = "세트메뉴를 삭제합니다.")
    @DeleteMapping("/delete")
    public ApiResponse<?> deleteSetMenu(@RequestParam("setMenuId") Integer setMenuId, @RequestParam("storeId") Integer storeId) {
        setMenuService.deleteSetMenu(setMenuId, storeId);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "세트메뉴 수정", description = "세트메뉴를 수정합니다")
    @PutMapping("/update/info")
    public ApiResponse<?> updateSetMenu(@RequestBody UpdateSetMenuRequest updateSetMenuRequest) {
        setMenuService.modifySetMenu(updateSetMenuRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    @Operation(summary = "세트메뉴 모든 정보 조회", description = "세트메뉴의 모든정보(세트메뉴 리스트 + 구성)를 조회합니다.")
    @GetMapping("/detail/info")
    public ApiResponse<SetMenuInfoResponse> selectDetailListSetMenu(@RequestParam("storeId") Integer storeId) {
        SetMenuInfoResponse setMenuInfoResponse = setMenuService.selectDetailSetMenuList(storeId);
        return ApiResponse.success(HttpStatus.OK, setMenuInfoResponse);
    }
}
