package com.hbhw.jippy.domain.qrcode.entity;

import com.hbhw.jippy.domain.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store_qrcode")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class QrCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "`explain`", nullable = false, columnDefinition = "TEXT")
    private String explain;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] qrcode;

    @Column(name = "created_at", nullable = false, length = 20)
    private String createdAt;
}
