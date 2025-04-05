package com.hbhw.jippy.domain.cash.service;

import com.hbhw.jippy.domain.cash.dto.request.CashRequest;
import com.hbhw.jippy.domain.cash.dto.response.CashResponse;
import com.hbhw.jippy.domain.cash.entity.Cash;
import com.hbhw.jippy.domain.cash.repository.CashRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CashService {

    private final CashRepository cashRepository;

    @Transactional
    public CashResponse createCash(Integer storeId, CashRequest request) {
        if (cashRepository.existsByStoreId(storeId)) {
            throw new IllegalArgumentException("이미 해당 매장의 시재 정보가 존재합니다");
        }

        Cash cash = Cash.builder()
                .storeId(storeId)
                .fiftyThousandWon(request.getFiftyThousandWon())
                .fiveThousandWon(request.getFiveThousandWon())
                .tenThousandWon(request.getTenThousandWon())
                .oneThousandWon(request.getOneThousandWon())
                .fiveHundredWon(request.getFiveHundredWon())
                .oneHundredWon(request.getOneHundredWon())
                .fiftyWon(request.getFiftyWon())
                .tenWon(request.getTenWon())
                .build();

        Cash savedCash = cashRepository.save(cash);
        return convertToResponse(savedCash);
    }

    @Transactional
    public CashResponse updateCash(Integer storeId, CashRequest request) {

        Cash cash = getCashEntity(storeId);

        cash.setFiftyThousandWon(request.getFiftyThousandWon());
        cash.setTenThousandWon(request.getTenThousandWon());
        cash.setFiveThousandWon(request.getFiveThousandWon());
        cash.setOneThousandWon(request.getOneThousandWon());
        cash.setFiveHundredWon(request.getFiveHundredWon());
        cash.setOneHundredWon(request.getOneHundredWon());
        cash.setFiftyWon(request.getFiftyWon());
        cash.setTenWon(request.getTenWon());

        Cash updatedCash = cashRepository.save(cash);
        return convertToResponse(updatedCash);
    }

    @Transactional
    public void updatePaymentCash(Integer storeId, CashRequest cashRequest) {

        Cash cash = getCashEntity(storeId);

        cash.setFiftyThousandWon(cash.getFiftyThousandWon() + cashRequest.getFiftyThousandWon());
        cash.setTenThousandWon(cash.getTenThousandWon() + cashRequest.getTenThousandWon());
        cash.setFiveThousandWon(cash.getFiveThousandWon() + cashRequest.getFiveThousandWon());
        cash.setOneThousandWon(cash.getOneThousandWon() + cashRequest.getOneThousandWon());
        cash.setFiveHundredWon(cash.getFiveHundredWon() + cashRequest.getFiveHundredWon());
        cash.setOneHundredWon(cash.getOneHundredWon() + cashRequest.getOneHundredWon());
        cash.setFiftyWon(cash.getFiftyWon() + cashRequest.getFiftyWon());
        cash.setTenWon(cash.getTenWon() + cashRequest.getTenWon());
    }

    public CashResponse getCash(Integer storeId) {
        Cash cash = cashRepository.findByStoreId(storeId)
                .orElseThrow(() -> new IllegalStateException("해당 매장의 시재 정보가 존재하지 않습니다"));
        return convertToResponse(cash);
    }

    private Cash getCashEntity(Integer storeId) {
        return cashRepository.findByStoreId(storeId)
                .orElseThrow(() -> new IllegalStateException("해당 매장의 시재 정보가 존재하지 않습니다"));
    }

    private CashResponse convertToResponse(Cash cash) {
        return CashResponse.builder()
                .id(cash.getId())
                .storeId(cash.getStoreId())
                .fiftyThousandWon(cash.getFiftyThousandWon())
                .tenThousandWon(cash.getTenThousandWon())
                .fiveThousandWon(cash.getFiveThousandWon())
                .oneThousandWon(cash.getOneThousandWon())
                .fiveHundedWon(cash.getFiveHundredWon())
                .oneHundredWon(cash.getOneHundredWon())
                .fiftyWon(cash.getFiftyWon())
                .tenWon(cash.getTenWon())
                .build();
    }
}
