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

import com.tiffin.entity.User;
import com.tiffin.exception.ResourceNotFoundException;
import com.tiffin.repository.UserRepository;
import java.security.Principal;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionService subscriptionService, UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Subscription>> getMySubscriptions(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getName()));
        return ResponseEntity.ok(subscriptionService.getByCustomer(user.getId()));
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

    @PostMapping("/{id}/transfer")
    public ResponseEntity<java.util.Map<String, Object>> transfer(
            @PathVariable Long id,
            @RequestBody com.tiffin.dto.TransferRequest request) {
        return ResponseEntity.ok(subscriptionService.transferSubscription(id, request));
    }
}
