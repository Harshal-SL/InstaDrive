package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.getUserById(#id).get().getEmail() == authentication.name")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUserProfile() {
        return userService.getUserByEmail(userService.getCurrentUserEmail())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.getUserById(#id).get().getEmail() == authentication.name")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.getUserById(id)
                .map(existingUser -> {
                    // Don't update email or password here
                    existingUser.setName(user.getName());
                    existingUser.setPhone(user.getPhone());
                    existingUser.setAddress(user.getAddress());
                    // Only admin can update role
                    if (userService.isCurrentUserAdmin()) {
                        existingUser.setRole(user.getRole());
                    }
                    return ResponseEntity.ok(userService.saveUser(existingUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.getUserById(id).isPresent()) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get bookings for the current user
     * @return List of bookings for the current user
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<?> getCurrentUserBookings() {
        try {
            // Get the current user's email
            String userEmail = userService.getCurrentUserEmail();

            // Get the user by email
            Optional<User> userOptional = userService.getUserByEmail(userEmail);
            if (userOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                errorResponse.put("status", "error");
                return ResponseEntity.status(404).body(errorResponse);
            }

            // Get the user's bookings
            Long userId = userOptional.get().getId();
            List<Booking> bookings = bookingService.getUserBookings(userId);

            // Create success response
            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error retrieving user bookings: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bookings: " + e.getMessage());
            errorResponse.put("status", "error");

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
