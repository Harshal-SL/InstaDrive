package com.alphaweb.instadrive.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String paymentMode; // UPI, CREDIT_CARD, DEBIT_CARD
    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED
    private double amount;
    private String transactionId;
    private LocalDateTime timestamp;

    private Long bookingId; // Reference to the booking
    private Long userId; // Reference to the user

    private String upiId;
    private String cardNumber; // Masked, if used
    private String cardExpiry; // Masked, if used
}
