package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.BookingHistoryResponse;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserBookingController {

    private final BookingService bookingService;
    private final UserService userService;

    /**
     * Get all bookings for the current user
     *
     * @return List of all bookings for the current user
     */
    @GetMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingHistoryResponse>> getCurrentUserBookings() {
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        List<BookingHistoryResponse> bookings = bookingService.getUserBookingHistory(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get current and future bookings for the current user
     *
     * @return List of current and future bookings for the current user
     */
    @GetMapping("/bookings/current-future")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingHistoryResponse>> getCurrentUserCurrentAndFutureBookings() {
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        List<BookingHistoryResponse> bookings = bookingService.getCurrentAndFutureBookingHistory(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get past bookings for the current user
     *
     * @return List of past bookings for the current user
     */
    @GetMapping("/bookings/past")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingHistoryResponse>> getCurrentUserPastBookings() {
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        List<BookingHistoryResponse> bookings = bookingService.getPastBookingHistory(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking history for a specific user (admin only)
     *
     * @param userId The ID of the user
     * @return List of bookings for the specified user
     */
    @GetMapping("/{userId}/bookings")
    // Temporarily removed authentication for testing
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingHistoryResponse>> getUserBookings(@PathVariable Long userId) {
        List<BookingHistoryResponse> bookings = bookingService.getUserBookingHistory(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking statistics for the current user
     *
     * @return Booking statistics for the current user
     */
    @GetMapping("/bookings/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCurrentUserBookingStats() {
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();

        List<BookingHistoryResponse> allBookings = bookingService.getUserBookingHistory(userId);
        List<BookingHistoryResponse> activeBookings = bookingService.getCurrentAndFutureBookingHistory(userId)
                .stream()
                .filter(booking -> "ACTIVE".equals(booking.getStatus()))
                .toList();
        List<BookingHistoryResponse> upcomingBookings = bookingService.getCurrentAndFutureBookingHistory(userId)
                .stream()
                .filter(booking -> "UPCOMING".equals(booking.getStatus()))
                .toList();
        List<BookingHistoryResponse> completedBookings = bookingService.getPastBookingHistory(userId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", allBookings.size());
        stats.put("activeBookings", activeBookings.size());
        stats.put("upcomingBookings", upcomingBookings.size());
        stats.put("completedBookings", completedBookings.size());

        // Calculate total amount spent
        double totalSpent = completedBookings.stream()
                .mapToDouble(BookingHistoryResponse::getTotalAmount)
                .sum();
        stats.put("totalSpent", totalSpent);

        return ResponseEntity.ok(stats);
    }
}
