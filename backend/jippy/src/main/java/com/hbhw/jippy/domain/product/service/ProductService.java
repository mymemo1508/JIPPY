package com.hbhw.jippy.domain.product.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.payment.service.PaymentHistoryService;
import com.hbhw.jippy.domain.product.dto.request.CreateProductRequest;
import com.hbhw.jippy.domain.product.dto.request.ProductUpdateRequest;
import com.hbhw.jippy.domain.product.dto.response.ProductDetailResponse;
import com.hbhw.jippy.domain.product.dto.response.ProductListResponse;
import com.hbhw.jippy.domain.product.dto.response.ProductMonthSoldResponse;
import com.hbhw.jippy.domain.product.dto.response.ProductSoldCountResponse;
import com.hbhw.jippy.domain.product.entity.Product;
import com.hbhw.jippy.domain.product.entity.ProductCategory;
import com.hbhw.jippy.domain.product.mapper.ProductMapper;
import com.hbhw.jippy.domain.product.repository.ProductRepository;
import com.hbhw.jippy.domain.store.dto.response.StoreResponse;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.service.StoreService;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import com.hbhw.jippy.utils.UUIDProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreService storeService;
    private final PaymentHistoryService paymentHistoryService;
    private final ProductCategoryService productCategoryService;
    private final S3Client s3Client;
    private final UUIDProvider uuidProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "store";

    @Value("${cloud.aws.s3.bucket}")
    private String s3BucketName;

    @Value("${cloud.aws.s3.bucket.base.url}")
    private String s3BaseUrl;

    /**
     * 상품 등록 + S3
     */
    @Transactional
    public void createProduct(CreateProductRequest createProductRequest, MultipartFile image, Integer storeId) {
        String key = CACHE_PREFIX + ":all" + storeId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            log.info("product : {} → delete", key);
            redisTemplate.delete(key);
        }

        Store storeEntity = storeService.getStoreEntity(storeId);
        ProductCategory productCategoryEntity = productCategoryService
                .getProductCategoryEntity(createProductRequest.getStoreId(), createProductRequest.getProductCategoryId());

        String imageName = uuidProvider.generateUUID() + "-" + image.getOriginalFilename();

        try {

            String imageUrl = "";

            if (!image.isEmpty()) {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(imageName)
                        .contentType(image.getContentType())
                        .contentLength(image.getSize())
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(image.getInputStream(), image.getSize()));
                imageUrl = s3Client.utilities().getUrl(builder -> builder.bucket(s3BucketName).key(imageName)).toExternalForm();
            } else {
                imageUrl = s3BaseUrl;
            }

            Product product = Product.builder()
                    .store(storeEntity)
                    .productCategory(productCategoryEntity)
                    .name(createProductRequest.getName())
                    .price(createProductRequest.getPrice())
                    .status(createProductRequest.isStatus())
                    .image(imageUrl)
                    .productType(createProductRequest.getProductType())
                    .productSize(createProductRequest.getProductSize())
                    .build();

            productRepository.save(product);
        } catch (IOException e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "이미지 업로드를 실패했습니다");
        } catch (Exception e) {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(s3BucketName).key(imageName).build());
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 저장에 실패했습니다.");
        }
    }

    /**
     * 매장별 상품 목록 조회
     */
    public List<ProductListResponse> getListAllProduct(Integer storeId) {
        String key = CACHE_PREFIX + ":all" + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if (cashJsonData != null) {
                log.info("product : cash hit!!");
                return objectMapper.readValue(cashJsonData, new TypeReference<>() {
                });
            }
            List<Product> productList = productRepository.findByStoreId(storeId);
            if (productList == null || productList.isEmpty()) {
                throw new BusinessException(CommonErrorCode.NOT_FOUND, "상품이 존재하지 않습니다");
            }

            List<ProductListResponse> productListResponseList = productList.stream()
                    .map(ProductMapper::convertProductListResponse)
                    .toList();

            String jsonData = objectMapper.writeValueAsString(productListResponseList); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 30));
            log.info("product : db search");
            return productListResponseList;

        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 서버 에러 발생");
        }
    }

    /**
     * 상품 상세 조회
     */
    public ProductDetailResponse getDetailProduct(Integer storeId, Long productId) {
        Product productEntity = getProduct(storeId, productId);

        return ProductDetailResponse.builder()
                .productId(productEntity.getId())
                .storeId(storeId)
                .name(productEntity.getName())
                .status(productEntity.isStatus())
                .productCategoryId(productEntity.getProductCategory().getId())
                .image(productEntity.getImage())
                .price(productEntity.getPrice())
                .productType(productEntity.getProductType())
                .productSize(productEntity.getProductSize())
                .build();
    }

    /**
     * 매장별 상품 수정
     */
    @Transactional
    public void modifyProduct(Integer storeId, Long productId, ProductUpdateRequest productUpdateRequest, MultipartFile image) {
        // 기존 상품 조회
        Product productEntity = getProduct(storeId, productId);

        // 새로운 상품 카테고리 엔티티 조회
        ProductCategory productCategoryEntity = productCategoryService.getProductCategoryEntity(storeId, productUpdateRequest.getProductCategoryId());

        // 기존 상품 엔티티의 필드를 업데이트
        productEntity.setProductCategory(productCategoryEntity);
        productEntity.setStatus(productUpdateRequest.isStatus());
        productEntity.setName(productUpdateRequest.getName());
        productEntity.setPrice(productUpdateRequest.getPrice());
        productEntity.setProductType(productUpdateRequest.getProductType());
        productEntity.setProductSize(productUpdateRequest.getProductSize());

        // 이미지가 전달되었다면 S3에 업로드 후 URL 업데이트
        if (image != null && !image.isEmpty()) {
            String imageName = uuidProvider.generateUUID() + "-" + image.getOriginalFilename();
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(s3BucketName)
                        .key(imageName)
                        .contentType(image.getContentType())
                        .contentLength(image.getSize())
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(image.getInputStream(), image.getSize()));
                String imageUrl = s3Client.utilities()
                        .getUrl(builder -> builder.bucket(s3BucketName).key(imageName))
                        .toExternalForm();
                productEntity.setImage(imageUrl);
            } catch (IOException e) {
                throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "이미지 업로드를 실패했습니다");
            } catch (Exception e) {
                s3Client.deleteObject(DeleteObjectRequest.builder().bucket(s3BucketName).key(imageName).build());
                throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 수정에 실패했습니다.");
            }
        }

        // 업데이트된 상품 엔티티 저장
        productRepository.save(productEntity);
    }

    /**
     * 매장 상품 삭제
     */
    public void deleteProduct(Integer storeId, Long productId) {
        Product productEntity = getProduct(storeId, productId);
        productRepository.deleteByStoreIdAndId(storeId, productId);
    }

    /**
     * 매장번호, 상품번호로 상품 조회하기
     */
    @Transactional(readOnly = true)
    public Product getProduct(Integer storeId, Long productId) {
        try {
            Optional<Product> product = productRepository.findByIdAndStoreId(productId, storeId);
            return product.orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "상품이 존재하지 않습니다."));
        } catch (BusinessException e) {
            log.error("상품 조회 실패 - storeId: {}, productId: {}, error: {}", storeId, productId, e.getMessage());
            throw e;
        }
    }

    /**
     * 해당 기간동안 상품들의 정보 및 판매 개수 조회
     */
    @Transactional(readOnly = true)
    public List<ProductDetailResponse> fetchAllProductInfo(Integer storeId, String startDate, String endDate) {
        String key = CACHE_PREFIX +":fetchAll" + storeId + startDate + endDate;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if (cashJsonData != null) {
                log.info("store : cash hit!!");
                return objectMapper.readValue(cashJsonData, new TypeReference<List<ProductDetailResponse>>() {
                });
            }
            List<Product> productList = productRepository.findByStoreId(storeId);
            Map<Long, Integer> soldInfo = paymentHistoryService.getTotalSoldByProduct(storeId, DateTimeUtils.getStartOfMonth(startDate), DateTimeUtils.getEndOfMonth(endDate));

            List<ProductDetailResponse> productDetailResponseList = productList.stream()
                    .map(product -> {
                        Integer totalSold = soldInfo.get(product.getId());
                        if (Objects.isNull(totalSold)) {
                            totalSold = 0;
                        }
                        return ProductMapper.convertProductFetchResponse(product, totalSold);
                    })
                    .toList();

            String jsonData = objectMapper.writeValueAsString(productDetailResponseList); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 3));
            log.info("product : db search");
            return productDetailResponseList;
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 서버 에러 발생");
        }
    }

    /**
     * 달별 상품 판매 개수 조회
     */
    public ProductMonthSoldResponse fetchMonthProductInfo(Integer storeId, String targetYear) {
        String key = CACHE_PREFIX + ":fetchMonth" + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {
            if (cashJsonData != null) {
                log.info("product : cash hit!!");
                return objectMapper.readValue(cashJsonData, ProductMonthSoldResponse.class);
            }

            Map<String, List<ProductSoldCountResponse>> soldmap = new HashMap<>();
            final String[] months = {"jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"};
            final String[] monthByNumber = {"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};

            for (int i = 0; i < 12; i++) { // 가상 스레드 적용
                String startDate = targetYear + "-" + monthByNumber[i] + "-01 00:00:00";
                String endDate = targetYear + "-" + monthByNumber[i] + "-31 23:59:59";
                List<ProductSoldCountResponse> resultMonth = paymentHistoryService.getMonthSoldByStoreId(storeId, startDate, endDate);
                soldmap.put(months[i], resultMonth);
            }
            ProductMonthSoldResponse productMonthSoldResponse = ProductMonthSoldResponse.builder()
                    .productMonthlySold(soldmap)
                    .build();

            String jsonData = objectMapper.writeValueAsString(productMonthSoldResponse); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 3));
            log.info("product : db search");
            return productMonthSoldResponse;
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "상품 서버 에러 발생");
        }
    }

}
