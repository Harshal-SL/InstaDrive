package com.alphaweb.instadrive.dto;

import com.alphaweb.instadrive.model.Car;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for booking response with detailed information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String referenceId;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalAmount;
    private String status;
    private boolean active;
    
    // User details
    private Long userId;
    private String userName;
    private String userEmail;
    
    // Car details
    private Long carId;
    private String carBrand;
    private String carModel;
    private String carRegistrationNumber;
}
