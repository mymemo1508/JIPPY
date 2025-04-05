package com.hbhw.jippy.domain.product.entity;

import com.hbhw.jippy.domain.product.enums.ProductSize;
import com.hbhw.jippy.domain.product.enums.ProductType;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.utils.converter.ProductSizeConverter;
import com.hbhw.jippy.utils.converter.ProductTypeConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@ToString
@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @Column
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_category_id")
    private ProductCategory productCategory;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column
    private String name;

    @Column
    private Integer price;

    @Column(name = "status")
    private boolean status;

    @Column
    private String image;

    @Column(name = "type")
    @Convert(converter = ProductTypeConverter.class)
    private ProductType productType;

    @Column(name = "size")
    @Convert(converter = ProductSizeConverter.class)
    private ProductSize productSize;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SetMenuConfig> setMenuConfigList = new ArrayList<>();
}
