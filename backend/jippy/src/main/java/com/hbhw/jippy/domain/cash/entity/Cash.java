package com.hbhw.jippy.domain.cash.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store_cash")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cash {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /*
     * Store Entity 미구현
     * @ManyToOne(fetch = FetchType.LAZY)
     * @JoinColumn(name = "store_id", nullable = false)
     * private Integer storeId;
     */

    @Column(name = "store_id", nullable = false)
    private Integer storeId;

    @Column(name = "fifty_thousand_won", nullable = false)
    private Integer fiftyThousandWon;

    @Column(name = "ten_thousand_won", nullable = false)
    private Integer tenThousandWon;

    @Column(name = "five_thousand_won", nullable = false)
    private Integer fiveThousandWon;

    @Column(name = "one_thousand_won", nullable = false)
    private Integer oneThousandWon;

    @Column(name = "five_hundred_won", nullable = false)
    private Integer fiveHundredWon;

    @Column(name = "one_hundred_won", nullable = false)
    private Integer oneHundredWon;

    @Column(name = "fifty_won", nullable = false)
    private Integer fiftyWon;

    @Column(name = "ten_won", nullable = false)
    private Integer tenWon;
}
