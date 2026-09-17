package com.tiffin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceResponse {

    private Long id;
    private Long subscriptionId;
    private String customerName;
    private String customerPhone;
    private String planName;
    private int billingMonth;
    private int billingYear;
    private int totalWeekdays;
    private int pausedDays;
    private int deliveredDays;
    private BigDecimal planPrice;
    private BigDecimal billedAmount;
    private LocalDateTime generatedAt;

    // ── Getters & Setters ──

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public int getBillingMonth() { return billingMonth; }
    public void setBillingMonth(int billingMonth) { this.billingMonth = billingMonth; }

    public int getBillingYear() { return billingYear; }
    public void setBillingYear(int billingYear) { this.billingYear = billingYear; }

    public int getTotalWeekdays() { return totalWeekdays; }
    public void setTotalWeekdays(int totalWeekdays) { this.totalWeekdays = totalWeekdays; }

    public int getPausedDays() { return pausedDays; }
    public void setPausedDays(int pausedDays) { this.pausedDays = pausedDays; }

    public int getDeliveredDays() { return deliveredDays; }
    public void setDeliveredDays(int deliveredDays) { this.deliveredDays = deliveredDays; }

    public BigDecimal getPlanPrice() { return planPrice; }
    public void setPlanPrice(BigDecimal planPrice) { this.planPrice = planPrice; }

    public BigDecimal getBilledAmount() { return billedAmount; }
    public void setBilledAmount(BigDecimal billedAmount) { this.billedAmount = billedAmount; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
