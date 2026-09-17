package com.tiffin.controller;

import com.tiffin.entity.User;
import com.tiffin.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tiffin-services")
public class TiffinServiceController {

    private final UserRepository userRepository;

    public TiffinServiceController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAvailableServices() {
        // Return all registered tiffin owners / kitchens
        List<User> owners = userRepository.findByRole(User.Role.OWNER);
        return ResponseEntity.ok(owners);
    }
}
