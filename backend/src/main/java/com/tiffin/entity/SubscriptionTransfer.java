package com.tiffin.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_transfers")
public class SubscriptionTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_subscription_id", nullable = false)
    private Long originalSubscriptionId;

    @Column(name = "new_subscription_id", nullable = false)
    private Long newSubscriptionId;

    @Column(name = "from_customer_id", nullable = false)
    private Long fromCustomerId;

    @Column(name = "from_customer_name", nullable = false)
    private String fromCustomerName;

    @Column(name = "to_customer_id", nullable = false)
    private Long toCustomerId;

    @Column(name = "to_customer_name", nullable = false)
    private String toCustomerName;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    @Column(length = 500)
    private String reason;

    @Column(name = "transferred_at", nullable = false)
    private LocalDateTime transferredAt = LocalDateTime.now();

    public SubscriptionTransfer() {}

    public SubscriptionTransfer(Long originalSubscriptionId, Long newSubscriptionId,
                                Long fromCustomerId, String fromCustomerName,
                                Long toCustomerId, String toCustomerName,
                                LocalDate transferDate, String reason) {
        this.originalSubscriptionId = originalSubscriptionId;
        this.newSubscriptionId = newSubscriptionId;
        this.fromCustomerId = fromCustomerId;
        this.fromCustomerName = fromCustomerName;
        this.toCustomerId = toCustomerId;
        this.toCustomerName = toCustomerName;
        this.transferDate = transferDate;
        this.reason = reason;
        this.transferredAt = LocalDateTime.now();
    }

    // ── Getters & Setters ──

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOriginalSubscriptionId() { return originalSubscriptionId; }
    public void setOriginalSubscriptionId(Long originalSubscriptionId) { this.originalSubscriptionId = originalSubscriptionId; }

    public Long getNewSubscriptionId() { return newSubscriptionId; }
    public void setNewSubscriptionId(Long newSubscriptionId) { this.newSubscriptionId = newSubscriptionId; }

    public Long getFromCustomerId() { return fromCustomerId; }
    public void setFromCustomerId(Long fromCustomerId) { this.fromCustomerId = fromCustomerId; }

    public String getFromCustomerName() { return fromCustomerName; }
    public void setFromCustomerName(String fromCustomerName) { this.fromCustomerName = fromCustomerName; }

    public Long getToCustomerId() { return toCustomerId; }
    public void setToCustomerId(Long toCustomerId) { this.toCustomerId = toCustomerId; }

    public String getToCustomerName() { return toCustomerName; }
    public void setToCustomerName(String toCustomerName) { this.toCustomerName = toCustomerName; }

    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getTransferredAt() { return transferredAt; }
    public void setTransferredAt(LocalDateTime transferredAt) { this.transferredAt = transferredAt; }
}
