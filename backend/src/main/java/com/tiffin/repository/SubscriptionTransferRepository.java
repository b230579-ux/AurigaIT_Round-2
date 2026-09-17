package com.tiffin.repository;

import com.tiffin.entity.SubscriptionTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionTransferRepository extends JpaRepository<SubscriptionTransfer, Long> {

    List<SubscriptionTransfer> findByOriginalSubscriptionId(Long originalSubscriptionId);

    List<SubscriptionTransfer> findByNewSubscriptionId(Long newSubscriptionId);

    List<SubscriptionTransfer> findAllByOrderByTransferredAtDesc();
}
