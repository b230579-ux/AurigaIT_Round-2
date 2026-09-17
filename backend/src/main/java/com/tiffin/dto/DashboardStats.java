package com.tiffin.dto;

import java.math.BigDecimal;

public class DashboardStats {

    private long totalCustomers;
    private long activeSubscriptions;
    private long pausedSubscriptions;
    private long cancelledSubscriptions;
    private BigDecimal totalRevenue; // sum of billed amounts for current month

    // ── Getters & Setters ──

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getActiveSubscriptions() { return activeSubscriptions; }
    public void setActiveSubscriptions(long activeSubscriptions) { this.activeSubscriptions = activeSubscriptions; }

    public long getPausedSubscriptions() { return pausedSubscriptions; }
    public void setPausedSubscriptions(long pausedSubscriptions) { this.pausedSubscriptions = pausedSubscriptions; }

    public long getCancelledSubscriptions() { return cancelledSubscriptions; }
    public void setCancelledSubscriptions(long cancelledSubscriptions) { this.cancelledSubscriptions = cancelledSubscriptions; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
