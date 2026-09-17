package com.tiffin.service;

import com.tiffin.entity.PausePeriod;
import com.tiffin.entity.Subscription;
import com.tiffin.exception.ResourceNotFoundException;
import com.tiffin.repository.PausePeriodRepository;
import com.tiffin.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PauseService {

    private final PausePeriodRepository pauseRepository;
    private final SubscriptionRepository subscriptionRepository;

    public PauseService(PausePeriodRepository pauseRepository,
                        SubscriptionRepository subscriptionRepository) {
        this.pauseRepository = pauseRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional
    public PausePeriod pauseSubscription(Long subscriptionId, String reason) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + subscriptionId));

        if (sub.getStatus() == Subscription.Status.CANCELLED) {
            throw new IllegalStateException("Cannot pause a cancelled subscription");
        }

        // Check if already paused
        if (pauseRepository.findBySubscriptionIdAndResumeDateIsNull(subscriptionId).isPresent()) {
            throw new IllegalStateException("Subscription is already paused");
        }

        PausePeriod pause = new PausePeriod(sub, LocalDate.now(), reason);
        sub.setStatus(Subscription.Status.PAUSED);
        subscriptionRepository.save(sub);

        return pauseRepository.save(pause);
    }

    @Transactional
    public PausePeriod resumeSubscription(Long subscriptionId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + subscriptionId));

        PausePeriod pause = pauseRepository.findBySubscriptionIdAndResumeDateIsNull(subscriptionId)
                .orElseThrow(() -> new IllegalStateException("Subscription is not currently paused"));

        pause.setResumeDate(LocalDate.now());
        sub.setStatus(Subscription.Status.ACTIVE);

        subscriptionRepository.save(sub);
        return pauseRepository.save(pause);
    }

    public List<PausePeriod> getPausePeriods(Long subscriptionId) {
        return pauseRepository.findBySubscriptionId(subscriptionId);
    }
}
