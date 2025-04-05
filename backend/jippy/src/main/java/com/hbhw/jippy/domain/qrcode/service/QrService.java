package com.hbhw.jippy.domain.qrcode.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.hbhw.jippy.domain.qrcode.dto.request.CreateQrRequest;
import com.hbhw.jippy.domain.qrcode.dto.response.QrResponse;
import com.hbhw.jippy.domain.qrcode.entity.QrCode;
import com.hbhw.jippy.domain.qrcode.repository.QrRepository;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.repository.StoreRepository;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QrService {
    private final StoreRepository storeRepository;
    private final QrRepository qrRepository;

    @Transactional
    public byte[] createQr(Integer storeId, CreateQrRequest request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 매장입니다."));

        byte[] qrImage = generateQrImage(request.getUrl());

        QrCode qrCode = QrCode.builder()
                .store(store)
                .explain(request.getExplain())
                .qrcode(qrImage)
                .createdAt(DateTimeUtils.nowString())
                .build();
        qrRepository.save(qrCode);

        return qrImage;
    }

    @Transactional(readOnly = true)
    public List<QrResponse> getQrList(Integer storeId) {
        return qrRepository.findAllByStoreId(storeId).stream()
                .map(QrResponse::of)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QrResponse getQr(Integer storeId, Long qrId) {
        QrCode qrCode = qrRepository.findByIdAndStoreId(qrId, storeId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 QR입니다."));

        return QrResponse.of(qrCode);
    }

    @Transactional
    public void deleteQr(Integer storeId, Long qrId) {
        QrCode qrCode = qrRepository.findByIdAndStoreId(qrId, storeId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 QR입니다."));

        qrRepository.delete(qrCode);
    }

    /**
     * QR생성 및 이미지 변환 메서드
     */
    private byte[] generateQrImage(String url) {
        try {
            BitMatrix bitMatrix = new MultiFormatWriter()
                    .encode(url, BarcodeFormat.QR_CODE, 400, 400);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out);

            return out.toByteArray();
        } catch (WriterException e) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE);
        } catch (IOException e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
