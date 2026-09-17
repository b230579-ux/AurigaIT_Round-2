package com.tiffin.service;

import com.tiffin.dto.InvoiceResponse;
import com.tiffin.entity.Invoice;
import com.tiffin.entity.PausePeriod;
import com.tiffin.entity.Subscription;
import com.tiffin.exception.ResourceNotFoundException;
import com.tiffin.repository.InvoiceRepository;
import com.tiffin.repository.PausePeriodRepository;
import com.tiffin.repository.SubscriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PausePeriodRepository pauseRepository;

    public BillingService(InvoiceRepository invoiceRepository,
                          SubscriptionRepository subscriptionRepository,
                          PausePeriodRepository pauseRepository) {
        this.invoiceRepository = invoiceRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.pauseRepository = pauseRepository;
    }

    /**
     * Generate invoices for all active/paused subscriptions for a given month.
     * Skips subscriptions that already have an invoice for that period.
     */
    @Transactional
    public List<InvoiceResponse> generateInvoices(int month, int year) {
        List<Subscription> subs = subscriptionRepository.findAllActiveOrPaused();
        List<InvoiceResponse> results = new ArrayList<>();

        YearMonth ym = YearMonth.of(year, month);
        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();

        for (Subscription sub : subs) {
            // Skip if invoice already exists
            Optional<Invoice> existing = invoiceRepository
                    .findBySubscriptionIdAndBillingMonthAndBillingYear(sub.getId(), month, year);
            if (existing.isPresent()) {
                results.add(toResponse(existing.get()));
                continue;
            }

            // Skip if subscription started after this month
            if (sub.getStartDate().isAfter(monthEnd)) continue;

            // Calculate billing
            int totalWeekdays = countWeekdays(monthStart, monthEnd);

            // Adjust start if subscription started mid-month
            LocalDate effectiveStart = sub.getStartDate().isAfter(monthStart) ? sub.getStartDate() : monthStart;
            // Adjust end if subscription was cancelled mid-month
            LocalDate effectiveEnd = (sub.getEndDate() != null && sub.getEndDate().isBefore(monthEnd))
                    ? sub.getEndDate() : monthEnd;

            int effectiveWeekdays = countWeekdays(effectiveStart, effectiveEnd);

            // Count paused weekdays
            List<PausePeriod> pauses = pauseRepository.findOverlappingPauses(sub.getId(), monthStart, monthEnd);
            int pausedDays = countPausedWeekdays(pauses, effectiveStart, effectiveEnd);

            int deliveredDays = effectiveWeekdays - pausedDays;
            if (deliveredDays < 0) deliveredDays = 0;

            // Pro-rate: dailyRate = planPrice / totalWeekdays, billedAmount = dailyRate × deliveredDays
            BigDecimal planPrice = sub.getPlanPrice();
            BigDecimal dailyRate = totalWeekdays > 0
                    ? planPrice.divide(BigDecimal.valueOf(totalWeekdays), 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            BigDecimal billedAmount = dailyRate.multiply(BigDecimal.valueOf(deliveredDays))
                    .setScale(2, RoundingMode.HALF_UP);

            Invoice invoice = new Invoice();
            invoice.setSubscription(sub);
            invoice.setBillingMonth(month);
            invoice.setBillingYear(year);
            invoice.setTotalWeekdays(totalWeekdays);
            invoice.setPausedDays(pausedDays);
            invoice.setDeliveredDays(deliveredDays);
            invoice.setPlanPrice(planPrice);
            invoice.setBilledAmount(billedAmount);

            invoiceRepository.save(invoice);
            results.add(toResponse(invoice));
        }

        return results;
    }

    public InvoiceResponse getInvoice(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));
        return toResponse(inv);
    }

    public Page<InvoiceResponse> getInvoicesByCustomer(Long customerId, Pageable pageable) {
        return invoiceRepository.findByCustomerId(customerId, pageable).map(this::toResponse);
    }

    public Page<InvoiceResponse> getInvoicesBySubscription(Long subId, Pageable pageable) {
        return invoiceRepository.findBySubscriptionId(subId, pageable).map(this::toResponse);
    }

    // ── Helpers ──

    /** Count weekdays (Mon–Fri) between start and end, inclusive. */
    private int countWeekdays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate date = start;
        while (!date.isAfter(end)) {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
            date = date.plusDays(1);
        }
        return count;
    }

    /** Count weekdays that fall within any pause period, clamped to effective range. */
    private int countPausedWeekdays(List<PausePeriod> pauses, LocalDate rangeStart, LocalDate rangeEnd) {
        int count = 0;
        LocalDate date = rangeStart;
        while (!date.isAfter(rangeEnd)) {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                for (PausePeriod pause : pauses) {
                    if (pause.coversDate(date)) {
                        count++;
                        break; // don't double-count
                    }
                }
            }
            date = date.plusDays(1);
        }
        return count;
    }

    private InvoiceResponse toResponse(Invoice inv) {
        InvoiceResponse r = new InvoiceResponse();
        r.setId(inv.getId());
        r.setSubscriptionId(inv.getSubscription().getId());
        r.setCustomerName(inv.getSubscription().getCustomer().getName());
        r.setCustomerPhone(inv.getSubscription().getCustomer().getPhone());
        r.setPlanName(inv.getSubscription().getPlanName().name());
        r.setBillingMonth(inv.getBillingMonth());
        r.setBillingYear(inv.getBillingYear());
        r.setTotalWeekdays(inv.getTotalWeekdays());
        r.setPausedDays(inv.getPausedDays());
        r.setDeliveredDays(inv.getDeliveredDays());
        r.setPlanPrice(inv.getPlanPrice());
        r.setBilledAmount(inv.getBilledAmount());
        r.setGeneratedAt(inv.getGeneratedAt());
        return r;
    }
}
