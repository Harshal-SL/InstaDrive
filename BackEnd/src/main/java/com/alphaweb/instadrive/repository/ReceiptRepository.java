package com.alphaweb.instadrive.repository;

import com.alphaweb.instadrive.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByUserId(Long userId);
    Optional<Receipt> findByBookingId(Long bookingId);
    Optional<Receipt> findByTransactionId(String transactionId);
}
