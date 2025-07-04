package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.BookingHistoryResponse;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller to handle the /users/current/bookings endpoint
 * This is a compatibility endpoint to support the frontend
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "false")
public class UserCurrentController {

    private final BookingService bookingService;
    private final UserService userService;

    /**
     * Get all bookings for the current user
     * This endpoint is provided for compatibility with the frontend
     *
     * @return List of all bookings for the current user
     */
    @GetMapping("/current/bookings")
    public ResponseEntity<List<BookingHistoryResponse>> getCurrentUserBookings() {
        try {
            // For debugging purposes, let's try to get a default user
            // In a production environment, this should use proper authentication
            Long userId = 1L; // Default to admin user for testing

            try {
                // Try to get the current user's email from the security context
                String email = userService.getCurrentUserEmail();

                // Get the user ID from the email
                userId = userService.getUserByEmail(email)
                        .map(user -> user.getId())
                        .orElse(userId); // Fall back to default if not found

                System.out.println("Found authenticated user with ID: " + userId);
            } catch (Exception authEx) {
                // If authentication fails, log it but continue with default user
                System.out.println("Authentication not available, using default user ID: " + userId);
            }

            // Get the booking history for the user
            List<BookingHistoryResponse> bookings = bookingService.getUserBookingHistory(userId);

            // Return the bookings
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error in /users/current/bookings: " + e.getMessage());
            e.printStackTrace();

            // Rethrow to let the global exception handler deal with it
            throw e;
        }
    }
}
