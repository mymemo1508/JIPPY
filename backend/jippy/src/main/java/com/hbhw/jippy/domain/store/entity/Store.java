package com.hbhw.jippy.domain.store.entity;

import com.hbhw.jippy.domain.user.entity.UserOwner;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_owner_id", nullable = false)
    private UserOwner userOwner;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String address;

    @Column(name = "opening_date", nullable = false, length = 20)
    private String openingDate;

    @Column(name = "total_cash")
    private Integer totalCash;

    @Column(name = "business_registration_number", nullable = false, length = 20)
    private String businessRegistrationNumber;
}
