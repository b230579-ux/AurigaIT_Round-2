package com.tiffin.config;

import com.tiffin.entity.PausePeriod;
import com.tiffin.entity.Subscription;
import com.tiffin.entity.User;
import com.tiffin.repository.PausePeriodRepository;
import com.tiffin.repository.SubscriptionRepository;
import com.tiffin.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PausePeriodRepository pauseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      SubscriptionRepository subscriptionRepository,
                      PausePeriodRepository pauseRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.pauseRepository = pauseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if the database is empty
        if (userRepository.count() > 0) return;

        String encodedPassword = passwordEncoder.encode("password123");

        // Owner
        User owner = new User("Tiffin Owner", "9999000001", "owner@tiffin.com", encodedPassword, User.Role.OWNER);
        userRepository.save(owner);

        // Customers
        User priya = new User("Priya Sharma", "9876543210", "priya@example.com", encodedPassword, User.Role.CUSTOMER);
        User rahul = new User("Rahul Verma", "9876543211", "rahul@example.com", encodedPassword, User.Role.CUSTOMER);
        User anita = new User("Anita Desai", "9876543212", "anita@example.com", encodedPassword, User.Role.CUSTOMER);
        User vikram = new User("Vikram Singh", "9876543213", "vikram@example.com", encodedPassword, User.Role.CUSTOMER);
        userRepository.save(priya);
        userRepository.save(rahul);
        userRepository.save(anita);
        userRepository.save(vikram);

        // Subscriptions
        Subscription sub1 = new Subscription();
        sub1.setCustomer(priya);
        sub1.setPlanName(Subscription.PlanName.BASIC);
        sub1.setPlanPrice(new BigDecimal("2000.00"));
        sub1.setStartDate(LocalDate.of(2026, 9, 1));
        sub1.setStatus(Subscription.Status.ACTIVE);
        subscriptionRepository.save(sub1);

        Subscription sub2 = new Subscription();
        sub2.setCustomer(rahul);
        sub2.setPlanName(Subscription.PlanName.STANDARD);
        sub2.setPlanPrice(new BigDecimal("3000.00"));
        sub2.setStartDate(LocalDate.of(2026, 9, 1));
        sub2.setStatus(Subscription.Status.ACTIVE);
        subscriptionRepository.save(sub2);

        Subscription sub3 = new Subscription();
        sub3.setCustomer(anita);
        sub3.setPlanName(Subscription.PlanName.PREMIUM);
        sub3.setPlanPrice(new BigDecimal("4500.00"));
        sub3.setStartDate(LocalDate.of(2026, 9, 1));
        sub3.setStatus(Subscription.Status.PAUSED);
        subscriptionRepository.save(sub3);

        Subscription sub4 = new Subscription();
        sub4.setCustomer(vikram);
        sub4.setPlanName(Subscription.PlanName.BASIC);
        sub4.setPlanPrice(new BigDecimal("2000.00"));
        sub4.setStartDate(LocalDate.of(2026, 9, 1));
        sub4.setStatus(Subscription.Status.ACTIVE);
        subscriptionRepository.save(sub4);

        // Pause for Anita
        PausePeriod pause = new PausePeriod(sub3, LocalDate.of(2026, 9, 8), "Festival break");
        pauseRepository.save(pause);

        System.out.println("✅ Seed data loaded: 1 owner, 4 customers, 4 subscriptions, 1 pause");
    }
}
