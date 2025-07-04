package com.alphaweb.instadrive.dto;

import com.alphaweb.instadrive.util.DoubleDeserializer;
import com.alphaweb.instadrive.util.LongDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

@Data
public class UpiPaymentRequest {
    // Fields
    @JsonDeserialize(using = DoubleDeserializer.class)
    private Double amount;
    private String paymentMode;
    private String currency;
    private String receiptEmail;
    private String upiId; // For UPI
    @JsonDeserialize(using = LongDeserializer.class)
    private Long bookingId; // ID of the booking being paid for

    @JsonDeserialize(using = LongDeserializer.class)
    private Long userId; // ID of the user making the payment

    @Override
    public String toString() {
        return "UpiPaymentRequest{" +
                "bookingId=" + bookingId +
                ", userId=" + userId +
                ", amount=" + amount +
                ", upiId='" + upiId + '\'' +
                ", paymentMode='" + paymentMode + '\'' +
                ", currency='" + currency + '\'' +
                '}';  // Omitting receiptEmail for security
    }
}
