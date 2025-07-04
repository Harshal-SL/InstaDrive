package com.alphaweb.instadrive.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for admin dashboard booking information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardBookingDTO {
    private Long bookingId;
    private String referenceId;
    private Long userId;
    private String userIdString; // The unique user identifier string
    private String userName;
    private String userEmail;
    private Long carId;
    private String carBrand;
    private String carModel;
    private String carRegistrationNumber;
    private String status;
    private double amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate bookingDate; // The date when the booking was created
}
