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

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
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

    private BigDecimal getDefaultPrice(Subscription.PlanName plan) {
        return switch (plan) {
            case BASIC -> new BigDecimal("2000.00");
            case STANDARD -> new BigDecimal("3000.00");
            case PREMIUM -> new BigDecimal("4500.00");
        };
    }
}
