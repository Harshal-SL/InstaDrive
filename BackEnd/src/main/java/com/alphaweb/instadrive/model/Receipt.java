package com.alphaweb.instadrive.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long bookingId;
    private Long userId;
    private Long carId;
    private String transactionId;
    private LocalDateTime transactionDate;
    private double amount;
    private String paymentMethod;
    private String receiptPath;
    
    // Additional information for the receipt
    private String userName;
    private String userEmail;
    private String carBrand;
    private String carModel;
    private String carRegistrationNumber;
}
