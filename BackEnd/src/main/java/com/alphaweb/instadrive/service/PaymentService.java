package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.dto.*;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Payment;
import com.alphaweb.instadrive.model.PaymentStatus;
import com.alphaweb.instadrive.model.Receipt;
import com.alphaweb.instadrive.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;
    private final ReceiptService receiptService;

    /**
     * Process UPI payment and save payment details
     *
     * @param request The UPI payment request
     * @return The payment response
     * @throws RuntimeException if there's an error processing the payment
     */
    public PaymentResponse processUpiPayment(UpiPaymentRequest request) {
        // Validate booking ID is provided
        if (request.getBookingId() == null) {
            throw new RuntimeException("Booking ID is required");
        }

        // Validate user ID is provided
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        // Validate booking exists
        Optional<Booking> bookingOptional = bookingService.getBookingById(request.getBookingId());
        if (bookingOptional.isEmpty()) {
            throw new RuntimeException("Booking not found with ID: " + request.getBookingId());
        }

        // Create a new payment record
        Payment payment = new Payment();
        payment.setPaymentMode("UPI");
        payment.setAmount(request.getAmount());
        payment.setTimestamp(LocalDateTime.now());
        payment.setUpiId(request.getUpiId());
        payment.setBookingId(request.getBookingId());
        payment.setUserId(request.getUserId());

        // Generate a unique transaction ID
        String transactionId = "UPI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        payment.setTransactionId(transactionId);

        // Set payment status
        payment.setStatus(PaymentStatus.SUCCESS); // In a real system, this would depend on the payment gateway response

        try {
            // Save payment to database
            payment = paymentRepository.save(payment);

            // Generate receipt if payment is successful
            if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
                try {
                    generateReceiptForPayment(payment);
                } catch (Exception e) {
                    // Log receipt generation error but continue
                    System.err.println("Error generating receipt: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            // Create response
            PaymentResponse response = new PaymentResponse();
            response.setStatus(payment.getStatus().name());
            response.setTransactionId(payment.getTransactionId());
            response.setMessage("UPI Payment processed successfully.");
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Error processing UPI payment: " + e.getMessage(), e);
        }
    }

    /**
     * Process card payment and save payment details
     *
     * @param request The card payment request
     * @return The payment response
     * @throws RuntimeException if there's an error processing the payment
     */
    public PaymentResponse processCardPayment(CardPaymentRequest request) {
        // Validate booking ID is provided
        if (request.getBookingId() == null) {
            throw new RuntimeException("Booking ID is required");
        }

        // Validate user ID is provided
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        // Validate booking exists
        Optional<Booking> bookingOptional = bookingService.getBookingById(request.getBookingId());
        if (bookingOptional.isEmpty()) {
            throw new RuntimeException("Booking not found with ID: " + request.getBookingId());
        }

        // Create a new payment record
        Payment payment = new Payment();
        payment.setPaymentMode("CARD");
        payment.setAmount(request.getAmount());
        payment.setTimestamp(LocalDateTime.now());
        payment.setBookingId(request.getBookingId());
        payment.setUserId(request.getUserId());

        // Mask card number for security (store only last 4 digits)
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
            String maskedCardNumber = "XXXX-XXXX-XXXX-" +
                    request.getCardNumber().substring(request.getCardNumber().length() - 4);
            payment.setCardNumber(maskedCardNumber);
        }

        // Mask card expiry (store only month/year)
        if (request.getCardExpiry() != null) {
            payment.setCardExpiry(request.getCardExpiry());
        }

        // Generate a unique transaction ID
        String transactionId = "CARD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        payment.setTransactionId(transactionId);

        // Set payment status
        payment.setStatus(PaymentStatus.SUCCESS); // In a real system, this would depend on the payment gateway response

        try {
            // Save payment to database
            payment = paymentRepository.save(payment);

            // Generate receipt if payment is successful
            if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
                try {
                    generateReceiptForPayment(payment);
                } catch (Exception e) {
                    // Log receipt generation error but continue
                    System.err.println("Error generating receipt: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            // Create response
            PaymentResponse response = new PaymentResponse();
            response.setStatus(payment.getStatus().name());
            response.setTransactionId(payment.getTransactionId());
            response.setMessage("Card payment processed successfully.");
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Error processing card payment: " + e.getMessage(), e);
        }
    }

    /**
     * Generate a receipt for a successful payment
     *
     * @param payment The payment
     * @return The generated receipt
     * @throws RuntimeException if there's an error generating the receipt
     */
    private Receipt generateReceiptForPayment(Payment payment) {
        try {
            // Get the booking
            Optional<Booking> bookingOptional = bookingService.getBookingById(payment.getBookingId());
            if (bookingOptional.isEmpty()) {
                throw new RuntimeException("Booking not found with ID: " + payment.getBookingId());
            }

            Booking booking = bookingOptional.get();

            // Generate receipt
            return receiptService.generateReceipt(booking, payment.getTransactionId(), payment.getPaymentMode());
        } catch (Exception e) {
            throw new RuntimeException("Error generating receipt: " + e.getMessage(), e);
        }
    }

    /**
     * Get all payments
     *
     * @return List of all payments
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    /**
     * Get a payment by ID
     *
     * @param id The payment ID
     * @return The payment
     */
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    /**
     * Get payments by booking ID
     *
     * @param bookingId The booking ID
     * @return List of payments for the booking
     */
    public List<Payment> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    /**
     * Get payments by user ID
     *
     * @param userId The user ID
     * @return List of payments made by the user
     */
    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    /**
     * Process refund for a cancelled booking
     *
     * @param bookingId The booking ID to refund
     * @return PaymentResponse indicating refund status
     */
    public PaymentResponse processRefund(Long bookingId) {
        try {
            // Find the original payment for this booking
            List<Payment> payments = paymentRepository.findByBookingId(bookingId);

            if (payments.isEmpty()) {
                throw new RuntimeException("No payment found for booking ID: " + bookingId);
            }

            // Get the most recent successful payment
            Payment originalPayment = payments.stream()
                    .filter(p -> PaymentStatus.SUCCESS.equals(p.getStatus()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No successful payment found for booking ID: " + bookingId));

            // Create refund payment record
            Payment refundPayment = new Payment();
            refundPayment.setPaymentMode(originalPayment.getPaymentMode());
            refundPayment.setAmount(-originalPayment.getAmount()); // Negative amount for refund
            refundPayment.setTimestamp(LocalDateTime.now());
            refundPayment.setBookingId(bookingId);
            refundPayment.setUserId(originalPayment.getUserId());
            refundPayment.setStatus(PaymentStatus.REFUNDED);

            // Generate refund transaction ID
            String refundTransactionId = "REFUND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            refundPayment.setTransactionId(refundTransactionId);

            // Copy payment method details
            refundPayment.setUpiId(originalPayment.getUpiId());
            refundPayment.setCardNumber(originalPayment.getCardNumber());
            refundPayment.setCardExpiry(originalPayment.getCardExpiry());

            // Save refund payment
            refundPayment = paymentRepository.save(refundPayment);

            // Update original payment status
            originalPayment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(originalPayment);

            // Create response
            PaymentResponse response = new PaymentResponse();
            response.setStatus(PaymentStatus.REFUNDED.name());
            response.setTransactionId(refundTransactionId);
            response.setMessage("Refund processed successfully for booking ID: " + bookingId);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Error processing refund: " + e.getMessage(), e);
        }
    }

    /**
     * Get payment status for a booking
     *
     * @param bookingId The booking ID
     * @return Payment status information
     */
    public Map<String, Object> getPaymentStatus(Long bookingId) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);

        Map<String, Object> status = new HashMap<>();
        status.put("bookingId", bookingId);
        status.put("hasPaid", false);
        status.put("hasRefund", false);
        status.put("totalPaid", 0.0);
        status.put("totalRefunded", 0.0);
        status.put("payments", new ArrayList<>());

        if (!payments.isEmpty()) {
            double totalPaid = 0.0;
            double totalRefunded = 0.0;
            boolean hasPaid = false;
            boolean hasRefund = false;

            for (Payment payment : payments) {
                if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
                    totalPaid += payment.getAmount();
                    hasPaid = true;
                } else if (PaymentStatus.REFUNDED.equals(payment.getStatus())) {
                    totalRefunded += Math.abs(payment.getAmount());
                    hasRefund = true;
                }
            }

            status.put("hasPaid", hasPaid);
            status.put("hasRefund", hasRefund);
            status.put("totalPaid", totalPaid);
            status.put("totalRefunded", totalRefunded);
            status.put("payments", payments);
        }

        return status;
    }
}
