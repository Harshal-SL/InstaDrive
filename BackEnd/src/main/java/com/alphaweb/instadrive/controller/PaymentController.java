package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.*;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.model.Payment;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.CarService;
import com.alphaweb.instadrive.service.PaymentService;
import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;
    private final CarService carService;
    private final BookingService bookingService;

    @PostMapping("/upi")
    public ResponseEntity<?> upiPayment(@RequestBody UpiPaymentRequest request) {
        try {
            // Log the incoming request for debugging
            System.out.println("Received UPI payment request: " + request);

            // Validate required fields
            if (request.getBookingId() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Get the booking to ensure it exists and to get additional information
            Optional<Booking> bookingOptional = bookingService.getBookingById(request.getBookingId());
            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + request.getBookingId());
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Set user ID from booking if not provided
            if (request.getUserId() == null) {
                request.setUserId(booking.getUserId());
                System.out.println("Set userId from booking: " + request.getUserId());
            }

            // Set amount from booking if not provided
            if (request.getAmount() == null || request.getAmount() <= 0) {
                request.setAmount(booking.getTotalAmount());
                System.out.println("Set amount from booking: " + request.getAmount());
            }

            // Set currency if not provided
            if (request.getCurrency() == null || request.getCurrency().isEmpty()) {
                request.setCurrency("INR"); // Default currency
                System.out.println("Set default currency: " + request.getCurrency());
            }

            // Set payment mode if not provided
            if (request.getPaymentMode() == null || request.getPaymentMode().isEmpty()) {
                request.setPaymentMode("UPI");
                System.out.println("Set payment mode: " + request.getPaymentMode());
            }

            if (request.getUpiId() == null || request.getUpiId().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "UPI ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Log the complete request after filling in missing values
            System.out.println("Complete UPI payment request: " + request);

            // Process payment
            PaymentResponse response = paymentService.processUpiPayment(request);

            // Add booking ID to response for clarity
            Map<String, Object> enhancedResponse = new HashMap<>();
            enhancedResponse.put("status", response.getStatus());
            enhancedResponse.put("transactionId", response.getTransactionId());
            enhancedResponse.put("message", response.getMessage());
            enhancedResponse.put("bookingId", request.getBookingId());
            enhancedResponse.put("amount", request.getAmount());
            enhancedResponse.put("referenceId", booking.getReferenceId());

            return ResponseEntity.ok(enhancedResponse);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error processing UPI payment: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/card")
    public ResponseEntity<?> cardPayment(@RequestBody CardPaymentRequest request) {
        try {
            // Log the incoming request for debugging
            System.out.println("Received card payment request: " + request);

            // Validate required fields
            if (request.getBookingId() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Get the booking to ensure it exists and to get additional information
            Optional<Booking> bookingOptional = bookingService.getBookingById(request.getBookingId());
            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + request.getBookingId());
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Set user ID from booking if not provided
            if (request.getUserId() == null) {
                request.setUserId(booking.getUserId());
                System.out.println("Set userId from booking: " + request.getUserId());
            }

            // Set amount from booking if not provided
            if (request.getAmount() == null || request.getAmount() <= 0) {
                request.setAmount(booking.getTotalAmount());
                System.out.println("Set amount from booking: " + request.getAmount());
            }

            // Set currency if not provided
            if (request.getCurrency() == null || request.getCurrency().isEmpty()) {
                request.setCurrency("INR"); // Default currency
                System.out.println("Set default currency: " + request.getCurrency());
            }

            // Set payment mode if not provided
            if (request.getPaymentMode() == null || request.getPaymentMode().isEmpty()) {
                request.setPaymentMode("CARD");
                System.out.println("Set payment mode: " + request.getPaymentMode());
            }

            if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Card number is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Log the complete request after filling in missing values
            System.out.println("Complete card payment request: " + request);

            // Process payment
            PaymentResponse response = paymentService.processCardPayment(request);

            // Add booking ID to response for clarity
            Map<String, Object> enhancedResponse = new HashMap<>();
            enhancedResponse.put("status", response.getStatus());
            enhancedResponse.put("transactionId", response.getTransactionId());
            enhancedResponse.put("message", response.getMessage());
            enhancedResponse.put("bookingId", request.getBookingId());
            enhancedResponse.put("amount", request.getAmount());
            enhancedResponse.put("referenceId", booking.getReferenceId());

            return ResponseEntity.ok(enhancedResponse);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error processing card payment: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get all payments (admin only)
     *
     * @return List of all payments
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /**
     * Get a payment by ID
     *
     * @param id The payment ID
     * @return The payment
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Optional<Payment> paymentOptional = paymentService.getPaymentById(id);

        if (paymentOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Payment payment = paymentOptional.get();

        // Check if the payment belongs to the current user or the user is an admin
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        boolean isAdmin = userService.isCurrentUserAdmin();

        if (!payment.getUserId().equals(userId) && !isAdmin) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        return ResponseEntity.ok(payment);
    }

    /**
     * Get payments for the current user
     *
     * @return List of payments for the current user
     */
    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getCurrentUserPayments() {
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        List<Payment> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Get payments for a booking
     *
     * @param bookingId The booking ID
     * @return List of payments for the booking
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getPaymentsByBookingId(@PathVariable Long bookingId) {
        // Check if the booking belongs to the current user or the user is an admin
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        boolean isAdmin = userService.isCurrentUserAdmin();

        List<Payment> payments = paymentService.getPaymentsByBookingId(bookingId);

        // If not admin, filter payments to only show those belonging to the current user
        if (!isAdmin) {
            payments = payments.stream()
                    .filter(payment -> payment.getUserId().equals(userId))
                    .toList();
        }

        return ResponseEntity.ok(payments);
    }

    /**
     * Process payment for a booking using UPI
     *
     * @param bookingId The ID of the booking to pay for
     * @param request The UPI payment request
     * @return Payment response
     */
    @PostMapping("/booking/{bookingId}/upi")
    public ResponseEntity<?> processBookingUpiPayment(
            @PathVariable Long bookingId,
            @RequestBody UpiPaymentRequest request) {
        try {
            // Get the booking
            Optional<Booking> bookingOptional = bookingService.getBookingById(bookingId);
            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + bookingId);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Set booking ID and user ID in the request
            request.setBookingId(bookingId);
            request.setUserId(booking.getUserId());

            // Set amount if not provided or invalid
            if (request.getAmount() == null || request.getAmount() <= 0) {
                request.setAmount(booking.getTotalAmount());
            }

            // Validate UPI ID
            if (request.getUpiId() == null || request.getUpiId().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "UPI ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Process payment
            PaymentResponse response = paymentService.processUpiPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error processing UPI payment for booking: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Process payment for a booking using card
     *
     * @param bookingId The ID of the booking to pay for
     * @param request The card payment request
     * @return Payment response
     */
    @PostMapping("/booking/{bookingId}/card")
    public ResponseEntity<?> processBookingCardPayment(
            @PathVariable Long bookingId,
            @RequestBody CardPaymentRequest request) {
        try {
            // Get the booking
            Optional<Booking> bookingOptional = bookingService.getBookingById(bookingId);
            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + bookingId);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Set booking ID and user ID in the request
            request.setBookingId(bookingId);
            request.setUserId(booking.getUserId());

            // Set amount if not provided or invalid
            if (request.getAmount() == null || request.getAmount() <= 0) {
                request.setAmount(booking.getTotalAmount());
            }

            // Validate card details
            if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Card number is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Process payment
            PaymentResponse response = paymentService.processCardPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error processing card payment for booking: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Process refund for a cancelled booking
     *
     * @param bookingId The ID of the booking to refund
     * @return Refund response
     */
    @PostMapping("/booking/{bookingId}/refund")
    public ResponseEntity<?> processRefund(@PathVariable Long bookingId) {
        try {
            // Check if booking exists
            Optional<Booking> bookingOptional = bookingService.getBookingById(bookingId);
            if (bookingOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Booking not found with ID: " + bookingId);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Booking booking = bookingOptional.get();

            // Check if booking is cancelled
            if (!"CANCELLED".equals(booking.getStatus())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Refund can only be processed for cancelled bookings");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Process refund
            PaymentResponse response = paymentService.processRefund(bookingId);

            // Add booking information to response
            Map<String, Object> enhancedResponse = new HashMap<>();
            enhancedResponse.put("status", response.getStatus());
            enhancedResponse.put("transactionId", response.getTransactionId());
            enhancedResponse.put("message", response.getMessage());
            enhancedResponse.put("bookingId", bookingId);
            enhancedResponse.put("referenceId", booking.getReferenceId());

            return ResponseEntity.ok(enhancedResponse);

        } catch (Exception e) {
            System.err.println("Error processing refund: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process refund: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get payment status for a booking
     *
     * @param bookingId The ID of the booking
     * @return Payment status information
     */
    @GetMapping("/booking/{bookingId}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long bookingId) {
        try {
            Map<String, Object> paymentStatus = paymentService.getPaymentStatus(bookingId);
            return ResponseEntity.ok(paymentStatus);

        } catch (Exception e) {
            System.err.println("Error getting payment status: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get payment status: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }


}
