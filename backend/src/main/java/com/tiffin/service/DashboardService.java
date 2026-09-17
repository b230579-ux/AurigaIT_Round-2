package com.tiffin.service;

import com.tiffin.dto.DashboardStats;
import com.tiffin.entity.Invoice;
import com.tiffin.entity.Subscription;
import com.tiffin.entity.User;
import com.tiffin.repository.InvoiceRepository;
import com.tiffin.repository.SubscriptionRepository;
import com.tiffin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardService(UserRepository userRepository,
                            SubscriptionRepository subscriptionRepository,
                            InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();

        stats.setTotalCustomers(userRepository.findByRole(
                User.Role.CUSTOMER, org.springframework.data.domain.Pageable.unpaged()).getTotalElements());
        stats.setActiveSubscriptions(subscriptionRepository.countByStatus(Subscription.Status.ACTIVE));
        stats.setPausedSubscriptions(subscriptionRepository.countByStatus(Subscription.Status.PAUSED));
        stats.setCancelledSubscriptions(subscriptionRepository.countByStatus(Subscription.Status.CANCELLED));

        // Current month revenue
        LocalDate now = LocalDate.now();
        List<Invoice> monthInvoices = invoiceRepository.findByBillingPeriod(
                now.getMonthValue(), now.getYear());
        BigDecimal totalRevenue = monthInvoices.stream()
                .map(Invoice::getBilledAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);

        return stats;
    }
}
