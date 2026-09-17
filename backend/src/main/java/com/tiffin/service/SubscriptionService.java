package com.tiffin.service;

import com.tiffin.dto.SubscriptionRequest;
import com.tiffin.entity.Subscription;
import com.tiffin.entity.User;
import com.tiffin.exception.ResourceNotFoundException;
import com.tiffin.repository.SubscriptionRepository;
import com.tiffin.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.tiffin.dto.TransferRequest;
import com.tiffin.entity.PausePeriod;
import com.tiffin.entity.SubscriptionTransfer;
import com.tiffin.repository.PausePeriodRepository;
import com.tiffin.repository.SubscriptionTransferRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final SubscriptionTransferRepository transferRepository;
    private final PausePeriodRepository pauseRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               UserRepository userRepository,
                               SubscriptionTransferRepository transferRepository,
                               PausePeriodRepository pauseRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.transferRepository = transferRepository;
        this.pauseRepository = pauseRepository;
    }

    public Subscription createSubscription(SubscriptionRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + request.getCustomerId()));

        // Check for existing active subscription
        List<Subscription> active = subscriptionRepository
                .findByCustomerIdAndStatus(customer.getId(), Subscription.Status.ACTIVE);
        if (!active.isEmpty()) {
            throw new IllegalStateException("Customer already has an active subscription");
        }

        Subscription sub = new Subscription();
        sub.setCustomer(customer);
        sub.setStartDate(LocalDate.now());

        // Plan name
        Subscription.PlanName plan = Subscription.PlanName.BASIC;
        if (request.getPlanName() != null) {
            plan = Subscription.PlanName.valueOf(request.getPlanName().toUpperCase());
        }
        sub.setPlanName(plan);

        // Plan price — use provided or default
        if (request.getPlanPrice() != null) {
            sub.setPlanPrice(request.getPlanPrice());
        } else {
            sub.setPlanPrice(getDefaultPrice(plan));
        }

        sub.setStatus(Subscription.Status.ACTIVE);
        return subscriptionRepository.save(sub);
    }

    public Subscription getSubscription(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + id));
    }

    public List<Subscription> getByCustomer(Long customerId) {
        return subscriptionRepository.findByCustomerId(customerId);
    }

    public Page<Subscription> getByCustomerPaged(Long customerId, Pageable pageable) {
        return subscriptionRepository.findByCustomerId(customerId, pageable);
    }

    public Subscription cancelSubscription(Long id) {
        Subscription sub = getSubscription(id);
        if (sub.getStatus() == Subscription.Status.CANCELLED) {
            throw new IllegalStateException("Subscription is already cancelled");
        }
        sub.setStatus(Subscription.Status.CANCELLED);
        sub.setEndDate(LocalDate.now());
        return subscriptionRepository.save(sub);
    }

    public List<Subscription> getAll(Subscription.Status status) {
        if (status != null) {
            return subscriptionRepository.findByStatus(status);
        }
        return subscriptionRepository.findAllActiveOrPaused();
    }

    @Transactional
    public Map<String, Object> transferSubscription(Long subId, TransferRequest request) {
        Subscription sourceSub = getSubscription(subId);
        if (sourceSub.getStatus() == Subscription.Status.CANCELLED) {
            throw new IllegalStateException("Cannot transfer a cancelled subscription");
        }

        LocalDate transferDate = (request != null && request.getTransferDate() != null)
                ? request.getTransferDate() : LocalDate.now();

        if (transferDate.isBefore(sourceSub.getStartDate())) {
            throw new IllegalArgumentException("Transfer date (" + transferDate +
                    ") cannot be before subscription start date (" + sourceSub.getStartDate() + ")");
        }

        User targetCustomer;
        if (request != null && request.getTargetCustomerId() != null) {
            targetCustomer = userRepository.findById(request.getTargetCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target customer not found: " + request.getTargetCustomerId()));
        } else if (request != null && request.getTargetPhone() != null && !request.getTargetPhone().isBlank()) {
            targetCustomer = userRepository.findByPhone(request.getTargetPhone().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Target customer with phone " + request.getTargetPhone() + " not found."));
        } else {
            throw new IllegalArgumentException("Target customer ID or phone is required for transfer");
        }

        if (targetCustomer.getId().equals(sourceSub.getCustomer().getId())) {
            throw new IllegalArgumentException("Cannot transfer subscription to the same customer");
        }

        // Close source subscription on day before transferDate
        LocalDate sourceEndDate = transferDate.isAfter(sourceSub.getStartDate()) ? transferDate.minusDays(1) : sourceSub.getStartDate();
        sourceSub.setEndDate(sourceEndDate);
        sourceSub.setStatus(Subscription.Status.CANCELLED);
        subscriptionRepository.save(sourceSub);

        // Close any active open pause on source subscription
        Optional<PausePeriod> openPause = pauseRepository.findBySubscriptionIdAndResumeDateIsNull(sourceSub.getId());
        if (openPause.isPresent()) {
            PausePeriod p = openPause.get();
            p.setResumeDate(transferDate);
            pauseRepository.save(p);
        }

        // Create new subscription for target customer carrying over plan and price
        Subscription newSub = new Subscription();
        newSub.setCustomer(targetCustomer);
        newSub.setPlanName(sourceSub.getPlanName());
        newSub.setPlanPrice(sourceSub.getPlanPrice());
        newSub.setStartDate(transferDate);
        newSub.setStatus(Subscription.Status.ACTIVE);
        subscriptionRepository.save(newSub);

        // Record transfer
        SubscriptionTransfer transfer = new SubscriptionTransfer(
                sourceSub.getId(),
                newSub.getId(),
                sourceSub.getCustomer().getId(),
                sourceSub.getCustomer().getName(),
                targetCustomer.getId(),
                targetCustomer.getName(),
                transferDate,
                (request != null && request.getReason() != null) ? request.getReason() : "Mid-cycle subscription transfer"
        );
        transferRepository.save(transfer);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "Subscription successfully transferred from " + sourceSub.getCustomer().getName() + " to " + targetCustomer.getName());
        res.put("transferId", transfer.getId());
        res.put("transferDate", transferDate.toString());
        res.put("originalSubscriptionId", sourceSub.getId());
        res.put("newSubscriptionId", newSub.getId());
        res.put("fromCustomer", sourceSub.getCustomer().getName());
        res.put("toCustomer", targetCustomer.getName());
        res.put("planName", newSub.getPlanName().name());
        res.put("planPrice", newSub.getPlanPrice());

        return res;
    }

    private BigDecimal getDefaultPrice(Subscription.PlanName plan) {
        return switch (plan) {
            case BASIC -> new BigDecimal("2000.00");
            case STANDARD -> new BigDecimal("3000.00");
            case PREMIUM -> new BigDecimal("4500.00");
        };
    }
}
