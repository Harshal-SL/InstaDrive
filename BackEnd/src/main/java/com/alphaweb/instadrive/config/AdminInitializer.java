package com.alphaweb.instadrive.config;

import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.repository.UserRepository;
import com.alphaweb.instadrive.util.UserIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * This class initializes an admin user on application startup
 */
@Component
@RequiredArgsConstructor
public class AdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                System.out.println("Creating default admin user...");

                // Create admin user
                User adminUser = new User();
                adminUser.setName("Admin");
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@gmail.com");
                adminUser.setPassword(passwordEncoder.encode("admin@123"));
                adminUser.setPhone("1234567890");
                adminUser.setAddress("Admin Address");
                adminUser.setRole(User.Role.ADMIN);
                adminUser.setUserId(UserIdGenerator.generateUserId());

                // Save admin user
                userRepository.save(adminUser);

                System.out.println("Default admin user created successfully!");
            } else {
                System.out.println("Admin user already exists.");
            }
        };
    }
}
