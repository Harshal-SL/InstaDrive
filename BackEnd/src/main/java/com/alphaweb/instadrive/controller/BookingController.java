package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.BookingPaymentDTO;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.CarService;
import com.alphaweb.instadrive.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "false")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private CarService carService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        return booking.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Cancel a booking by ID
     * @param id Booking ID to cancel
     * @return Response indicating success or failure
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            Optional<Booking> bookingOptional = bookingService.getBookingById(id);

            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + id);
                errorResponse.put("status", "error");
                return ResponseEntity.status(404).body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Check if booking can be cancelled
            if ("CANCELLED".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Cannot cancel a booking that is already " + booking.getStatus().toLowerCase());
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Update booking status to CANCELLED
            booking.setStatus("CANCELLED");
            bookingService.updateBooking(id, booking);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Booking cancelled successfully");
            response.put("bookingId", id);
            response.put("referenceId", booking.getReferenceId());
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error cancelling booking: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to cancel booking: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Update booking status
     * @param id Booking ID
     * @param statusRequest Request containing new status
     * @return Updated booking
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> statusRequest) {
        try {
            String newStatus = statusRequest.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Status is required");
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Optional<Booking> bookingOptional = bookingService.getBookingById(id);
            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + id);
                errorResponse.put("status", "error");
                return ResponseEntity.status(404).body(errorResponse);
            }

            Booking booking = bookingOptional.get();
            booking.setStatus(newStatus.toUpperCase());
            Booking updatedBooking = bookingService.updateBooking(id, booking);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Booking status updated successfully");
            response.put("booking", updatedBooking);
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error updating booking status: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update booking status: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> addBooking(@RequestBody String requestBody) {
        try {
            System.out.println("Raw request body: " + requestBody);

            // Parse the JSON manually to handle flexible input
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(requestBody);

            // Create booking object
            Booking booking = new Booking();

            // Extract carId
            if (jsonNode.has("carId")) {
                booking.setCarId(jsonNode.get("carId").asLong());
            } else {
                throw new RuntimeException("carId is required");
            }

            // Extract and parse dates
            String startDateStr = jsonNode.has("startDate") ? jsonNode.get("startDate").asText() : null;
            String endDateStr = jsonNode.has("endDate") ? jsonNode.get("endDate").asText() : null;

            if (startDateStr == null || endDateStr == null) {
                throw new RuntimeException("startDate and endDate are required");
            }

            // Handle different date formats
            LocalDate startDate = parseDate(startDateStr);
            LocalDate endDate = parseDate(endDateStr);

            booking.setStartDate(startDate);
            booking.setEndDate(endDate);

            // Calculate total amount if not provided
            if (jsonNode.has("totalAmount")) {
                booking.setTotalAmount(jsonNode.get("totalAmount").asDouble());
            } else {
                // Calculate based on car price and duration
                Optional<Car> carOpt = carService.getCarById(booking.getCarId());
                if (carOpt.isPresent()) {
                    Car car = carOpt.get();
                    long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
                    if (days <= 0) days = 1; // Minimum 1 day
                    booking.setTotalAmount(car.getPricePerDay() * days);
                } else {
                    throw new RuntimeException("Car not found with ID: " + booking.getCarId());
                }
            }

            // Handle user ID - try multiple approaches
            Long userId = null;

            // 1. Check if userId is provided directly
            if (jsonNode.has("userId")) {
                userId = jsonNode.get("userId").asLong();
            }

            // 2. If no userId, try to find/create user based on email
            if (userId == null && jsonNode.has("email")) {
                String email = jsonNode.get("email").asText();
                String name = jsonNode.has("name") ? jsonNode.get("name").asText() : "Guest User";
                String phone = jsonNode.has("phone") ? jsonNode.get("phone").asText() : "";

                userId = findOrCreateUser(email, name, phone);
            }

            // 3. If still no userId, use default admin user
            if (userId == null) {
                userId = 1L; // Default to admin user
                System.out.println("Warning: No user information provided, using default user ID: 1");
            }

            booking.setUserId(userId);

            System.out.println("Final booking object: " + booking);

            // Save the booking
            Booking savedBooking = bookingService.addBooking(booking);

            if (savedBooking == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Car is not available for the selected dates");
                errorResponse.put("carId", booking.getCarId());
                errorResponse.put("startDate", booking.getStartDate());
                errorResponse.put("endDate", booking.getEndDate());
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create success response
            Map<String, Object> response = new HashMap<>();
            response.put("booking", savedBooking);
            response.put("bookingId", savedBooking.getId());
            response.put("referenceId", savedBooking.getReferenceId());
            response.put("message", "Booking confirmed with reference ID: " + savedBooking.getReferenceId());
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error creating booking: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create booking: " + e.getMessage());
            errorResponse.put("status", "error");

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Parse date from various formats
     */
    private LocalDate parseDate(String dateStr) {
        try {
            // Handle ISO datetime format (2025-05-27T16:34:59.630Z)
            if (dateStr.contains("T")) {
                return LocalDate.parse(dateStr.substring(0, 10));
            }
            // Handle date-only format (2025-05-27)
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format: " + dateStr + ". Expected YYYY-MM-DD or ISO datetime format.");
        }
    }

    /**
     * Find existing user or create new user
     */
    private Long findOrCreateUser(String email, String name, String phone) {
        try {
            // Try to find existing user by email
            Optional<User> existingUser = userService.getUserByEmail(email);
            if (existingUser.isPresent()) {
                System.out.println("Found existing user: " + existingUser.get().getId());
                return existingUser.get().getId();
            }

            // Create new user
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPhone(phone);
            newUser.setAddress(""); // Default empty address
            newUser.setPassword("temp123"); // Temporary password
            newUser.setRole(User.Role.USER);

            // Generate unique username and userId
            newUser.setUsername(email); // Use email as username
            newUser.setUserId("USER-" + System.currentTimeMillis());

            User savedUser = userService.saveUser(newUser);
            System.out.println("Created new user: " + savedUser.getId());
            return savedUser.getId();

        } catch (Exception e) {
            System.err.println("Error finding/creating user: " + e.getMessage());
            return 1L; // Fallback to admin user
        }
    }

    // Add other existing methods here...

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

    /**
     * Return a car (mark booking as completed)
     * @param id Booking ID
     * @return Response indicating success or failure
     */
    @PutMapping("/{id}/return")
    public ResponseEntity<?> returnCar(@PathVariable Long id) {
        try {
            Optional<Booking> bookingOptional = bookingService.getBookingById(id);

            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + id);
                errorResponse.put("status", "error");
                return ResponseEntity.status(404).body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Check if booking can be returned
            if ("CANCELLED".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Cannot return a booking that is already " + booking.getStatus().toLowerCase());
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Update booking status to COMPLETED
            booking.setStatus("COMPLETED");
            bookingService.updateBooking(id, booking);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Car returned successfully. Booking completed.");
            response.put("bookingId", id);
            response.put("referenceId", booking.getReferenceId());
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error returning car: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to return car: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Check and update expired bookings
     * @return Response with number of bookings updated
     */
    @PostMapping("/check-expired")
    public ResponseEntity<?> checkExpiredBookings() {
        try {
            int updatedCount = bookingService.updateExpiredBookings();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Expired bookings checked and updated");
            response.put("updatedCount", updatedCount);
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error checking expired bookings: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check expired bookings: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
