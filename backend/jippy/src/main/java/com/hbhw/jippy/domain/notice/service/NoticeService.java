package com.hbhw.jippy.domain.notice.service;

import com.hbhw.jippy.domain.notice.dto.request.NoticeCreateRequest;
import com.hbhw.jippy.domain.notice.dto.request.NoticeUpdateRequest;
import com.hbhw.jippy.domain.notice.dto.response.NoticeResponse;
import com.hbhw.jippy.domain.notice.entity.Notice;
import com.hbhw.jippy.domain.notice.repository.NoticeRepository;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.global.pagination.dto.request.PaginationRequest;
import com.hbhw.jippy.global.pagination.dto.response.PaginationResponse;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional
    public NoticeResponse createNotice(Integer storeId, NoticeCreateRequest request) {

        Notice notice = Notice.builder()
                .storeId(Store.builder().id(storeId).build())
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(DateTimeUtils.nowString())
                .author(request.getAuthor())
                .build();

        Notice savedNotice = noticeRepository.save(notice);
        return convertToResponse(savedNotice);
    }

    @Transactional(readOnly = true)
    public PaginationResponse<NoticeResponse> getNoticeList(Integer storeId, PaginationRequest paginationRequest) {

        Page<Notice> noticePage = noticeRepository.findByStoreIdAndSearchConditions(
                storeId,
                paginationRequest.getStartDate(),
                paginationRequest.getEndDate(),
                paginationRequest.toPageable()
        );

        Page<NoticeResponse> responsePage = noticePage.map(notice -> NoticeResponse.builder()
                .noticeId(notice.getId())
                .storeId(notice.getStoreId().getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .createdAt(notice.getCreatedAt())
                .author(notice.getAuthor())
                .build());

        return PaginationResponse.of(responsePage, paginationRequest);
    }

    @Transactional(readOnly = true)
    public NoticeResponse getNotice(Integer storeId, Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 공지사항입니다"));

        if (!notice.getStoreId().getId().equals(storeId)) {
            throw new BusinessException(CommonErrorCode.BAD_REQUEST, "해당 매장의 공지사항이 아닙니다");
        }

        return convertToResponse(notice);
    }

    @Transactional
    public NoticeResponse updateNotice(Integer storeId, Long noticeId, NoticeUpdateRequest request) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 공지사항입니다"));

        if (!notice.getStoreId().getId().equals(storeId)) {
            throw new BusinessException(CommonErrorCode.BAD_REQUEST, "해당 매장의 공지사항이 아닙니다");
        }

        if (request.getTitle() != null) {
            notice.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            notice.setContent(request.getContent());
        }

        return convertToResponse(notice);
    }

    @Transactional
    public void deleteNotice(Integer storeId, Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "존재하지 않는 공지사항입니다"));

        if (!notice.getStoreId().getId().equals(storeId)) {
            throw new BusinessException(CommonErrorCode.BAD_REQUEST, "해당 매장의 공지사항이 아닙니다");
        }

        noticeRepository.delete(notice);
    }


    private NoticeResponse convertToResponse(Notice notice) {
        return NoticeResponse.builder()
                .noticeId(notice.getId())
                .storeId(notice.getStoreId().getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .createdAt(DateTimeUtils.nowString())
                .author(notice.getAuthor())
                .build();
    }

}
