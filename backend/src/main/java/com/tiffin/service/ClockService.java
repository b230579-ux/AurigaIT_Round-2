package com.tiffin.service;

import com.tiffin.entity.OutboxMessage;
import com.tiffin.entity.PausePeriod;
import com.tiffin.entity.Subscription;
import com.tiffin.repository.OutboxMessageRepository;
import com.tiffin.repository.PausePeriodRepository;
import com.tiffin.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Service
public class ClockService {

    private final SubscriptionRepository subscriptionRepository;
    private final PausePeriodRepository pauseRepository;
    private final OutboxMessageRepository outboxRepository;

    public ClockService(SubscriptionRepository subscriptionRepository,
                        PausePeriodRepository pauseRepository,
                        OutboxMessageRepository outboxRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.pauseRepository = pauseRepository;
        this.outboxRepository = outboxRepository;
    }

    @Transactional
    public Map<String, Object> tickClock(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        DayOfWeek dow = date.getDayOfWeek();
        boolean isWeekday = (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("clockDate", date.toString());
        result.put("dayOfWeek", dow.name());
        result.put("isWeekday", isWeekday);

        if (!isWeekday) {
            result.put("message", "Weekend (" + dow.name() + "). No weekday lunch deliveries scheduled today.");
            result.put("notifiedCount", 0);
            result.put("notifications", Collections.emptyList());
            return result;
        }

        List<Subscription> activeOrPausedSubs = subscriptionRepository.findAllActiveOrPaused();
        List<OutboxMessage> createdNotifications = new ArrayList<>();
        int pausedCount = 0;

        final LocalDate finalDate = date;
        for (Subscription sub : activeOrPausedSubs) {
            // Check start and end dates
            if (sub.getStartDate().isAfter(finalDate)) continue;
            if (sub.getEndDate() != null && sub.getEndDate().isBefore(finalDate)) continue;
            if (sub.getStatus() == Subscription.Status.CANCELLED) continue;

            // Check if customer is paused on this date
            List<PausePeriod> pauses = pauseRepository.findOverlappingPauses(sub.getId(), finalDate, finalDate);
            boolean isPausedToday = pauses.stream().anyMatch(p -> p.coversDate(finalDate));

            if (isPausedToday) {
                pausedCount++;
                continue; // Do NOT notify paused customers
            }

            // Customer is due a delivery today! Notify via Outbox
            String msg = "Hello " + sub.getCustomer().getName() + ", your " + sub.getPlanName() +
                    " lunch delivery is scheduled for today (" + date + "). Enjoy your meal!";

            OutboxMessage outboxMsg = new OutboxMessage(
                    sub.getCustomer().getId(),
                    sub.getCustomer().getName(),
                    sub.getCustomer().getPhone(),
                    sub.getCustomer().getEmail(),
                    sub.getPlanName().name(),
                    date,
                    msg
            );

            outboxRepository.save(outboxMsg);
            createdNotifications.add(outboxMsg);
        }

        result.put("totalEligibleSubscriptions", activeOrPausedSubs.size());
        result.put("pausedCount", pausedCount);
        result.put("notifiedCount", createdNotifications.size());
        result.put("message", "Clock tick processed: " + createdNotifications.size() + " customers notified for delivery.");
        result.put("notifications", createdNotifications);

        return result;
    }

    public List<OutboxMessage> getOutboxMessages(LocalDate date) {
        if (date != null) {
            return outboxRepository.findByDeliveryDateOrderByCreatedAtDesc(date);
        }
        return outboxRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void clearOutbox() {
        outboxRepository.deleteAll();
    }
}
