package com.tiffin.repository;

import com.tiffin.entity.OutboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OutboxMessageRepository extends JpaRepository<OutboxMessage, Long> {

    List<OutboxMessage> findByDeliveryDateOrderByCreatedAtDesc(LocalDate deliveryDate);

    List<OutboxMessage> findAllByOrderByCreatedAtDesc();

    boolean existsByCustomerIdAndDeliveryDate(Long customerId, LocalDate deliveryDate);
}
