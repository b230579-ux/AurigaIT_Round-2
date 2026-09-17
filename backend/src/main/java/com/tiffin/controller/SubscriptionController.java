package com.tiffin.controller;

import com.tiffin.dto.SubscriptionRequest;
import com.tiffin.entity.Subscription;
import com.tiffin.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> getAll(
            @RequestParam(required = false) Subscription.Status status) {
        return ResponseEntity.ok(subscriptionService.getAll(status));
    }

    @PostMapping
    public ResponseEntity<Subscription> create(@Valid @RequestBody SubscriptionRequest request) {
        Subscription sub = subscriptionService.createSubscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sub);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subscription> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscription(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Subscription>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(subscriptionService.getByCustomer(customerId));
    }

    @GetMapping("/customer/{customerId}/paged")
    public ResponseEntity<Page<Subscription>> getByCustomerPaged(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(subscriptionService.getByCustomerPaged(customerId,
                PageRequest.of(page, size, sort)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Subscription> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id));
    }
}
