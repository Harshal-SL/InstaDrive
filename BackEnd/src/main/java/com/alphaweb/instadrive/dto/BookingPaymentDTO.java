package com.alphaweb.instadrive.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for connecting booking and payment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingPaymentDTO {
    private Long bookingId;
    private String referenceId;
    private Long userId;
    private Long carId;
    private String carBrand;
    private String carModel;
    private double amount;
    private String status;
}
