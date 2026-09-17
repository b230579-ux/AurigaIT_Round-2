package com.tiffin.repository;

import com.tiffin.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Page<Invoice> findBySubscriptionId(Long subscriptionId, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.subscription.customer.id = :customerId")
    Page<Invoice> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);

    Optional<Invoice> findBySubscriptionIdAndBillingMonthAndBillingYear(
            Long subscriptionId, int billingMonth, int billingYear);

    @Query("SELECT i FROM Invoice i WHERE i.billingMonth = :month AND i.billingYear = :year")
    List<Invoice> findByBillingPeriod(@Param("month") int month, @Param("year") int year);
}
