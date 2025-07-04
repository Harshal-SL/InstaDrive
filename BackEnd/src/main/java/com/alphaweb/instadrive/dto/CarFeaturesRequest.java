package com.alphaweb.instadrive.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating car features
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarFeaturesRequest {
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
