package com.tiffin.repository;

import com.tiffin.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByCustomerId(Long customerId);

    Page<Subscription> findByCustomerId(Long customerId, Pageable pageable);

    List<Subscription> findByCustomerIdAndStatus(Long customerId, Subscription.Status status);

    List<Subscription> findByStatus(Subscription.Status status);

    @Query("SELECT s FROM Subscription s WHERE s.status IN ('ACTIVE', 'PAUSED')")
    List<Subscription> findAllActiveOrPaused();

    @Query("SELECT s FROM Subscription s WHERE s.startDate <= :end AND (s.endDate IS NULL OR s.endDate >= :start)")
    List<Subscription> findActiveInPeriod(@Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.status = :status")
    long countByStatus(@Param("status") Subscription.Status status);
}
