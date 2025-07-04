package com.alphaweb.instadrive.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for car requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarRequest {
    private String brand;
    private String model;
    private int year;
    private String color;
    private String registrationNumber;
    private double rentalPrice;
    private boolean available;
    
    // Car features
    private boolean airConditioning;
    private boolean bluetooth;
    private boolean gpsNavigation;
    private boolean leatherSeats;
    private boolean sunroof;
    private boolean backupCamera;
    private boolean parkingSensors;
    private boolean keylessEntry;
    private boolean heatedSeats;
    private boolean appleCarPlay;
    private boolean androidAuto;
}
