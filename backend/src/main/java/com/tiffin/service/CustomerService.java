package com.tiffin.service;

import com.tiffin.entity.User;
import com.tiffin.exception.ResourceNotFoundException;
import com.tiffin.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final UserRepository userRepository;

    public CustomerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<User> getAllCustomers(Pageable pageable) {
        return userRepository.findByRole(User.Role.CUSTOMER, pageable);
    }

    public Page<User> searchCustomers(String query, Pageable pageable) {
        return userRepository.findByRoleAndPhoneContainingOrRoleAndNameContainingIgnoreCase(
                User.Role.CUSTOMER, query,
                User.Role.CUSTOMER, query,
                pageable);
    }

    public User getCustomerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        if (user.getRole() != User.Role.CUSTOMER) {
            throw new ResourceNotFoundException("Customer not found: " + id);
        }
        return user;
    }

    public User getCustomerByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with phone: " + phone));
    }
}
