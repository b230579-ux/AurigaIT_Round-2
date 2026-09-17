package com.tiffin.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices",
       uniqueConstraints = @UniqueConstraint(columnNames = {"subscription_id", "billing_month", "billing_year"}))
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(name = "billing_month", nullable = false)
    private int billingMonth;

    @Column(name = "billing_year", nullable = false)
    private int billingYear;

    @Column(name = "total_weekdays", nullable = false)
    private int totalWeekdays;

    @Column(name = "paused_days", nullable = false)
    private int pausedDays;

    @Column(name = "delivered_days", nullable = false)
    private int deliveredDays;

    @Column(name = "plan_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal planPrice;

    @Column(name = "billed_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal billedAmount;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    public Invoice() {}

    // ── Getters & Setters ──

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subscription getSubscription() { return subscription; }
    public void setSubscription(Subscription subscription) { this.subscription = subscription; }

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
