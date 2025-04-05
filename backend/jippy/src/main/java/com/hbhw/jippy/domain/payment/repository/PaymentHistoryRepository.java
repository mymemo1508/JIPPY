package com.hbhw.jippy.domain.payment.repository;

import com.hbhw.jippy.domain.payment.dto.ProductTotalSold;
import com.hbhw.jippy.domain.payment.dto.response.SalesByDayResponse;
import com.hbhw.jippy.domain.payment.dto.response.SalesResponse;
import com.hbhw.jippy.domain.payment.entity.PaymentHistory;
import com.hbhw.jippy.domain.product.dto.response.ProductSoldCountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentHistoryRepository extends MongoRepository<PaymentHistory, Integer> {

    List<PaymentHistory> findByStoreId(Integer storeId, Sort sort);

    Page<PaymentHistory> findByStoreId(Integer storeId, String startDate, String endDate, Pageable pageable);

    List<PaymentHistory> findByStoreIdAndPaymentStatus(Integer storeId, String paymentStatus, Sort sort);

    Optional<PaymentHistory> findByUUID(String UUID);

    @Aggregation(pipeline = {
            "{ $match: { store_id: ?0, updated_at: { $gte: ?1, $lt: ?2 } } }",
            "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d %H', date: { $toDate: '$updated_at' } } }," +
                    " totalSales: { $sum: { $convert: { input: '$total_cost', to: 'double', onError: 0, onNull: 0 } } } } }",
            "{ $project: { date: '$_id', totalSales: '$totalSales', _id: 0 } }",
            "{ $sort: { date: 1 } }"
    })
    Optional<List<SalesResponse>> getTimeSales(Integer storeId, String startDate, String endDate);

    @Aggregation(pipeline = {
            "{ $match: { store_id: ?0, updated_at: { $gte: ?1, $lt: ?2 } } }",
            "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$updated_at' } } }," +
                    " totalSales: { $sum: { $convert: { input: '$total_cost', to: 'double', onError: 0, onNull: 0 } } } } }",
            "{ $project: { date: '$_id', totalSales: '$totalSales', _id: 0 } }",
            "{ $sort: { date: 1 } }"
    })
    Optional<List<SalesResponse>> getDailySales(Integer storeId, String startDate, String endDate);

    // 주별 매출 조회
    @Aggregation(pipeline = {
            "{ $match: { store_id: ?0, updated_at: { $gte: ?1, $lt: ?2 } } }",
            "{ $group: { _id: { $dateToString: { format: '%Y-%U', date: { $toDate: '$updated_at' } } }," +
                    " totalSales: { $sum: { $convert: { input: '$total_cost', to: 'double', onError: 0, onNull: 0 } } } } }",
            "{ $project: { date: '$_id', totalSales: '$totalSales', _id: 0 } }",
            "{ $sort: { date: 1 } }"
    })
    Optional<List<SalesResponse>> getWeeklySales(Integer storeId, String startDate, String endDate);

    @Aggregation(pipeline = {
            "{ $match: { store_id: ?0, updated_at: { $exists: true, $gte: ?1, $lt: ?2 } } }",
            "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: { $toDate: '$updated_at' } } }, " +
                    " totalSales: { $sum: { $convert: { input: '$total_cost', to: 'double', onError: 0, onNull: 0 } } }, " +
                    " orderCount: { $sum: 1 } } }",
            "{ $project: { date: '$_id', totalSales: '$totalSales', orderCount: '$orderCount', _id: 0 } }",
            "{ $sort: { date: 1 } }"
    })
    Optional<List<SalesResponse>> getMonthlySales(Integer storeId, String startDate, String endDate);

    /**
     *  특정 기간 결제 내역 에서 상품 판매량 조회
     */
    @Aggregation(pipeline = {
            // store_id와 updated_at(특정 기간)를 조건으로 매칭
            "{ '$match': { 'store_id': ?0, 'updated_at': { '$gte': ?1, '$lte': ?2 } } }",
            "{ '$unwind': '$buyProduct' }",
            "{ '$group': { '_id': '$buyProduct.product_id', " +
                    "'totalQuantity': { '$sum': '$buyProduct.product_quantity' }} }",
            "{ '$project': { '_id': 0, 'productId': '$_id', 'totalQuantity': 1 } }"
    })
    Optional<List<ProductTotalSold>> getProductSoldByStoreAndPeriod(Integer storeId, String startDate, String endDate);


    /**
     *  상품을 달별로 판매한 정보 조회
     */
    @Aggregation(pipeline = {
            "{ $match: { store_id: ?0, updated_at: { $gte: ?1, $lte: ?2 } } }",
            "{ $unwind: '$buyProduct' }",
            "{ $group: { " +
                    "_id: { productId: '$buyProduct.product_id', productName: '$buyProduct.product_name' }, " +
                    "soldCount: { $sum: '$buyProduct.product_quantity' } " +
                    "} }",
            "{ $project: { " +
                    "productId: '$_id.productId', " +
                    "productName: '$_id.productName', " +
                    "soldCount: 1, " +
                    "_id: 0 " +
                    "} }",
            "{ $sort: { soldCount: -1 } }"
    })
    Optional<List<ProductSoldCountResponse>> getRangeDateSaleProduct(Integer storeId, String startDate, String endDate);
}
