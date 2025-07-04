package com.alphaweb.instadrive.dto;

import com.alphaweb.instadrive.util.DoubleDeserializer;
import com.alphaweb.instadrive.util.LongDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

@Data
public class CardPaymentRequest {
    // Fields
    @JsonDeserialize(using = DoubleDeserializer.class)
    private Double amount;
    private String paymentMode;
    private String currency;
    private String receiptEmail;
    private String cardNumber; // For Credit/Debit card
    private String cardExpiry; // Card expiry
    private String cardCvc;    // Card CVC
    @JsonDeserialize(using = LongDeserializer.class)
    private Long bookingId; // ID of the booking being paid for

    @JsonDeserialize(using = LongDeserializer.class)
    private Long userId; // ID of the user making the payment

    @Override
    public String toString() {
        return "CardPaymentRequest{" +
                "bookingId=" + bookingId +
                ", userId=" + userId +
                ", amount=" + amount +
                ", cardNumber='" + (cardNumber != null ? "****" + cardNumber.substring(Math.max(0, cardNumber.length() - 4)) : null) + '\'' +
                ", paymentMode='" + paymentMode + '\'' +
                ", currency='" + currency + '\'' +
                '}';  // Omitting sensitive card details and receiptEmail for security
    }
}
