package com.alphaweb.instadrive.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String model;
    private String fuelType;
    private String registrationNumber;
    private double pricePerDay;
    private String transmission;
    private String color;
    private int year;
    private String description;
    private String imageUrl;

    // Car features as boolean values
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
