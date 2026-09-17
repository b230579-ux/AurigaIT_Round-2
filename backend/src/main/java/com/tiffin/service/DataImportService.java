package com.tiffin.service;

import com.tiffin.entity.Subscription;
import com.tiffin.entity.User;
import com.tiffin.repository.SubscriptionRepository;
import com.tiffin.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class DataImportService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,                    // yyyy-MM-dd
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),           // 01/09/2026
            DateTimeFormatter.ofPattern("d/M/yyyy"),             // 1/9/2026
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),           // 09/01/2026
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),           // 01-09-2026
            DateTimeFormatter.ofPattern("d-MMM-yyyy", Locale.ENGLISH),  // 1-Sep-2026
            DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH), // 01-Sep-2026
            DateTimeFormatter.ofPattern("yyyy/MM/dd")            // 2026/09/01
    );

    public DataImportService(UserRepository userRepository,
                             SubscriptionRepository subscriptionRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Map<String, Object> importCustomerList(List<Map<String, Object>> records) {
        List<Map<String, Object>> imported = new ArrayList<>();
        List<Map<String, Object>> deduped = new ArrayList<>();
        List<Map<String, Object>> rejected = new ArrayList<>();

        Set<String> seenPhonesInBatch = new HashSet<>();
        String defaultPassword = passwordEncoder.encode("password123");

        int rowIndex = 0;
        for (Map<String, Object> record : records) {
            rowIndex++;
            String rawName = getString(record, "name", "customerName", "Name");
            String rawPhone = getString(record, "phone", "phoneNumber", "mobile", "Phone");
            String rawEmail = getString(record, "email", "Email");
            String rawDate = getString(record, "startDate", "date", "StartDate");
            String rawPlan = getString(record, "plan", "planName", "Plan");

            // 1. Validate Name
            if (rawName == null || rawName.trim().isEmpty()) {
                rejected.add(buildRejectEntry(rowIndex, record, "Missing customer name"));
                continue;
            }
            String cleanName = rawName.trim();

            // 2. Validate & Normalize Phone
            String normalizedPhone = normalizePhone(rawPhone);
            if (normalizedPhone == null) {
                rejected.add(buildRejectEntry(rowIndex, record,
                        "Invalid phone: '" + rawPhone + "'. Must be a valid 10-digit number."));
                continue;
            }

            // 3. Check for Duplicate in Batch
            if (seenPhonesInBatch.contains(normalizedPhone)) {
                deduped.add(Map.of(
                        "row", rowIndex,
                        "name", cleanName,
                        "phone", normalizedPhone,
                        "reason", "Duplicate phone number in import batch"
                ));
                continue;
            }
            seenPhonesInBatch.add(normalizedPhone);

            // 4. Parse Date
            LocalDate parsedDate = parseFlexibleDate(rawDate);
            if (rawDate != null && !rawDate.trim().isEmpty() && parsedDate == null) {
                rejected.add(buildRejectEntry(rowIndex, record,
                        "Invalid date format: '" + rawDate + "'. Supported: yyyy-MM-dd, dd/MM/yyyy, dd-MMM-yyyy"));
                continue;
            }
            if (parsedDate == null) {
                parsedDate = LocalDate.now();
            }

            // 5. Parse Plan
            Subscription.PlanName plan = parsePlan(rawPlan);

            // 6. Check for Duplicate in DB
            Optional<User> existingUserOpt = userRepository.findByPhone(normalizedPhone);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                // Check if user has active subscription
                List<Subscription> activeSubs = subscriptionRepository
                        .findByCustomerIdAndStatus(existingUser.getId(), Subscription.Status.ACTIVE);
                if (!activeSubs.isEmpty()) {
                    deduped.add(Map.of(
                            "row", rowIndex,
                            "customerId", existingUser.getId(),
                            "name", existingUser.getName(),
                            "phone", normalizedPhone,
                            "reason", "Customer already exists in database with active subscription"
                    ));
                    continue;
                }
            }

            // 7. Create or update user
            User user;
            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
            } else {
                user = new User();
                user.setName(cleanName);
                user.setPhone(normalizedPhone);
                String email = (rawEmail != null && !rawEmail.trim().isEmpty())
                        ? rawEmail.trim()
                        : "user_" + normalizedPhone + "@tiffin.local";
                // If email already used by someone else, make it unique
                if (userRepository.existsByEmail(email)) {
                    email = "user_" + normalizedPhone + "_" + System.currentTimeMillis() + "@tiffin.local";
                }
                user.setEmail(email);
                user.setPassword(defaultPassword);
                user.setRole(User.Role.CUSTOMER);
                userRepository.save(user);
            }

            // 8. Create Subscription
            Subscription sub = new Subscription();
            sub.setCustomer(user);
            sub.setPlanName(plan);
            sub.setPlanPrice(getDefaultPrice(plan));
            sub.setStartDate(parsedDate);
            sub.setStatus(Subscription.Status.ACTIVE);
            subscriptionRepository.save(sub);

            Map<String, Object> importedItem = new LinkedHashMap<>();
            importedItem.put("row", rowIndex);
            importedItem.put("subscriptionId", sub.getId());
            importedItem.put("customerId", user.getId());
            importedItem.put("name", user.getName());
            importedItem.put("phone", user.getPhone());
            importedItem.put("plan", plan.name());
            importedItem.put("startDate", parsedDate.toString());
            imported.add(importedItem);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalRecords", records.size());
        report.put("importedCount", imported.size());
        report.put("dedupedCount", deduped.size());
        report.put("rejectedCount", rejected.size());
        report.put("imported", imported);
        report.put("deduped", deduped);
        report.put("rejected", rejected);

        return report;
    }

    // ── Helper parsing methods ──

    private String normalizePhone(String raw) {
        if (raw == null) return null;
        // Strip everything except digits
        String digits = raw.replaceAll("[^0-9]", "");
        // If 12 digits starting with 91 (e.g. +91 9876543210)
        if (digits.length() == 12 && digits.startsWith("91")) {
            digits = digits.substring(2);
        }
        // If 11 digits starting with 0
        if (digits.length() == 11 && digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        if (digits.length() == 10) {
            return digits;
        }
        return null; // Invalid length
    }

    private LocalDate parseFlexibleDate(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        String clean = raw.trim();
        for (DateTimeFormatter fmt : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(clean, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    private Subscription.PlanName parsePlan(String raw) {
        if (raw == null) return Subscription.PlanName.BASIC;
        String upper = raw.trim().toUpperCase();
        if (upper.contains("PREMIUM")) return Subscription.PlanName.PREMIUM;
        if (upper.contains("STANDARD")) return Subscription.PlanName.STANDARD;
        return Subscription.PlanName.BASIC;
    }

    private BigDecimal getDefaultPrice(Subscription.PlanName plan) {
        return switch (plan) {
            case BASIC -> new BigDecimal("2000.00");
            case STANDARD -> new BigDecimal("3000.00");
            case PREMIUM -> new BigDecimal("4500.00");
        };
    }

    private String getString(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                return map.get(k).toString();
            }
        }
        return null;
    }

    private Map<String, Object> buildRejectEntry(int row, Map<String, Object> record, String reason) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("row", row);
        entry.put("record", record);
        entry.put("reason", reason);
        return entry;
    }
}
