package com.tiffin.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SubscriptionRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private String planName; // BASIC, STANDARD, PREMIUM

    private BigDecimal planPrice; // optional override; defaults based on plan

    // ── Getters & Setters ──

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public BigDecimal getPlanPrice() { return planPrice; }
    public void setPlanPrice(BigDecimal planPrice) { this.planPrice = planPrice; }
}
