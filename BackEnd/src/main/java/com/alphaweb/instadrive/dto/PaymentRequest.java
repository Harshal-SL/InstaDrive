package com.alphaweb.instadrive.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private double amount;
    private String paymentMode; // "UPI", "CREDIT_CARD", "DEBIT_CARD"
}
