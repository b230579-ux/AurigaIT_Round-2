package com.tiffin.repository;

import com.tiffin.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Page<User> findByRole(User.Role role, Pageable pageable);

    Page<User> findByRoleAndPhoneContaining(User.Role role, String phone, Pageable pageable);

    Page<User> findByRoleAndNameContainingIgnoreCase(User.Role role, String name, Pageable pageable);

    Page<User> findByRoleAndPhoneContainingOrRoleAndNameContainingIgnoreCase(
            User.Role role1, String phone,
            User.Role role2, String name,
            Pageable pageable);
}
