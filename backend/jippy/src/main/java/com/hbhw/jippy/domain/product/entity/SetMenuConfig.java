package com.hbhw.jippy.domain.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "set_menu_config")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SetMenuConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_menu_id", nullable = false)
    private SetMenu setMenu;
}
