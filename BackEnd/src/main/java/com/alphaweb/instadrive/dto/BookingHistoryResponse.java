package com.alphaweb.instadrive.dto;

import com.alphaweb.instadrive.model.Car;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for booking history response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingHistoryResponse {
    private Long bookingId;
    private String referenceId; // Unique booking reference ID
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalAmount;
    private Car car;
    private String status; // "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"
}
