package com.alphaweb.instadrive.repository;

import com.alphaweb.instadrive.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Find payments by booking ID
    List<Payment> findByBookingId(Long bookingId);

    // Find payments by user ID
    List<Payment> findByUserId(Long userId);

    // Find payments by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
}
