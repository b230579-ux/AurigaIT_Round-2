package com.tiffin.repository;

import com.tiffin.entity.PausePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PausePeriodRepository extends JpaRepository<PausePeriod, Long> {

    List<PausePeriod> findBySubscriptionId(Long subscriptionId);

    /** Find an open (not yet resumed) pause for a subscription. */
    Optional<PausePeriod> findBySubscriptionIdAndResumeDateIsNull(Long subscriptionId);

    /** Find all pause periods for a subscription that overlap with a given month. */
    @Query("SELECT p FROM PausePeriod p WHERE p.subscription.id = :subId " +
           "AND (p.resumeDate IS NULL OR p.resumeDate >= :monthStart) " +
           "AND p.pauseDate <= :monthEnd")
    List<PausePeriod> findOverlappingPauses(
            @Param("subId") Long subscriptionId,
            @Param("monthStart") java.time.LocalDate monthStart,
            @Param("monthEnd") java.time.LocalDate monthEnd);
}
