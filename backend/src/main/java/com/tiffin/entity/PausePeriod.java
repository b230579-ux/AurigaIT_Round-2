package com.tiffin.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pause_periods")
public class PausePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @NotNull
    @Column(name = "pause_date", nullable = false)
    private LocalDate pauseDate;

    @Column(name = "resume_date")
    private LocalDate resumeDate; // null means still paused

    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PausePeriod() {}

    public PausePeriod(Subscription subscription, LocalDate pauseDate, String reason) {
        this.subscription = subscription;
        this.pauseDate = pauseDate;
        this.reason = reason;
    }

    /** Returns true if delivery is paused on the given date. */
    public boolean coversDate(LocalDate date) {
        if (date.isBefore(pauseDate)) return false;
        if (resumeDate == null) return true; // still paused
        return !date.isAfter(resumeDate.minusDays(1)); // resume date = first day back
    }

    // ── Getters & Setters ──

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subscription getSubscription() { return subscription; }
    public void setSubscription(Subscription subscription) { this.subscription = subscription; }

    public LocalDate getPauseDate() { return pauseDate; }
    public void setPauseDate(LocalDate pauseDate) { this.pauseDate = pauseDate; }

    public LocalDate getResumeDate() { return resumeDate; }
    public void setResumeDate(LocalDate resumeDate) { this.resumeDate = resumeDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
