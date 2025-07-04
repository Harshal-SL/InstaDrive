package com.alphaweb.instadrive.dto;

import lombok.Data;

@Data
public class PaymentResponse {
    private String status;
    private String transactionId;
    private String message;
}
