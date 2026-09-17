package com.tiffin.controller;

import com.tiffin.dto.InvoiceResponse;
import com.tiffin.service.BillingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<InvoiceResponse>> generateInvoices(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(billingService.generateInvoices(month, year));
    }

    @GetMapping("/invoice/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoice(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Page<InvoiceResponse>> getByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "generatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(billingService.getInvoicesByCustomer(customerId,
                PageRequest.of(page, size, sort)));
    }

    @GetMapping("/subscription/{subId}")
    public ResponseEntity<Page<InvoiceResponse>> getBySubscription(
            @PathVariable Long subId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(billingService.getInvoicesBySubscription(subId,
                PageRequest.of(page, size, Sort.by("generatedAt").descending())));
    }
}
