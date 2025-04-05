package com.hbhw.jippy.domain.qrcode.repository;

import com.hbhw.jippy.domain.qrcode.entity.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QrRepository extends JpaRepository<QrCode, Long> {
    List<QrCode> findAllByStoreId(Integer storeId);
    Optional<QrCode> findByIdAndStoreId(Long qrId, Integer storeId);
}
