package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.CarFeaturesRequest;
import com.alphaweb.instadrive.dto.CarImageRequest;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.CarService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class CarControllerTest {

    @Mock
    private CarService carService;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private CarController carController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateCarFeatures_CarExists_ReturnsUpdatedCar() {
        // Arrange
        Long carId = 1L;
        Car car = new Car();
        car.setId(carId);
        car.setBrand("Toyota");
        car.setModel("Camry");

        // Initial features are all false
        car.setAirConditioning(false);
        car.setBluetooth(false);
        car.setGpsNavigation(false);
        car.setLeatherSeats(false);
        car.setSunroof(false);
        car.setBackupCamera(false);
        car.setParkingSensors(false);
        car.setKeylessEntry(false);
        car.setHeatedSeats(false);
        car.setAppleCarPlay(false);
        car.setAndroidAuto(false);

        // Create features request with some features enabled
        CarFeaturesRequest featuresRequest = new CarFeaturesRequest();
        featuresRequest.setAirConditioning(true);
        featuresRequest.setBluetooth(true);
        featuresRequest.setGpsNavigation(true);
        featuresRequest.setLeatherSeats(false);
        featuresRequest.setSunroof(false);
        featuresRequest.setBackupCamera(true);
        featuresRequest.setParkingSensors(true);
        featuresRequest.setKeylessEntry(true);
        featuresRequest.setHeatedSeats(false);
        featuresRequest.setAppleCarPlay(true);
        featuresRequest.setAndroidAuto(true);

        // Mock car service
        when(carService.getCarById(carId)).thenReturn(Optional.of(car));

        // Mock updated car
        Car updatedCar = new Car();
        updatedCar.setId(carId);
        updatedCar.setBrand("Toyota");
        updatedCar.setModel("Camry");
        updatedCar.setAirConditioning(true);
        updatedCar.setBluetooth(true);
        updatedCar.setGpsNavigation(true);
        updatedCar.setLeatherSeats(false);
        updatedCar.setSunroof(false);
        updatedCar.setBackupCamera(true);
        updatedCar.setParkingSensors(true);
        updatedCar.setKeylessEntry(true);
        updatedCar.setHeatedSeats(false);
        updatedCar.setAppleCarPlay(true);
        updatedCar.setAndroidAuto(true);

        when(carService.addCar(any(Car.class))).thenReturn(updatedCar);

        // Act
        ResponseEntity<?> response = carController.updateCarFeatures(carId, featuresRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Car);

        Car responseCar = (Car) response.getBody();
        assertEquals(carId, responseCar.getId());
        assertTrue(responseCar.isAirConditioning());
        assertTrue(responseCar.isBluetooth());
        assertTrue(responseCar.isGpsNavigation());
        assertFalse(responseCar.isLeatherSeats());
        assertFalse(responseCar.isSunroof());
        assertTrue(responseCar.isBackupCamera());
        assertTrue(responseCar.isParkingSensors());
        assertTrue(responseCar.isKeylessEntry());
        assertFalse(responseCar.isHeatedSeats());
        assertTrue(responseCar.isAppleCarPlay());
        assertTrue(responseCar.isAndroidAuto());
    }

    @Test
    void updateCarFeatures_CarNotFound_ReturnsNotFound() {
        // Arrange
        Long carId = 1L;
        CarFeaturesRequest featuresRequest = new CarFeaturesRequest();

        // Mock car service to return empty
        when(carService.getCarById(carId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = carController.updateCarFeatures(carId, featuresRequest);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateCarImage_CarExists_ReturnsUpdatedCar() {
        // Arrange
        Long carId = 1L;
        String imageUrl = "https://example.com/car-image.jpg";

        Car car = new Car();
        car.setId(carId);
        car.setBrand("Toyota");
        car.setModel("Camry");
        car.setImageUrl(null); // No image URL initially

        CarImageRequest imageRequest = new CarImageRequest();
        imageRequest.setImageUrl(imageUrl);

        // Mock car service
        when(carService.getCarById(carId)).thenReturn(Optional.of(car));

        // Mock updated car
        Car updatedCar = new Car();
        updatedCar.setId(carId);
        updatedCar.setBrand("Toyota");
        updatedCar.setModel("Camry");
        updatedCar.setImageUrl(imageUrl);

        when(carService.addCar(any(Car.class))).thenReturn(updatedCar);

        // Act
        ResponseEntity<?> response = carController.updateCarImage(carId, imageRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Car);

        Car responseCar = (Car) response.getBody();
        assertEquals(carId, responseCar.getId());
        assertEquals(imageUrl, responseCar.getImageUrl());
    }

    @Test
    void updateCarImage_CarNotFound_ReturnsNotFound() {
        // Arrange
        Long carId = 1L;
        CarImageRequest imageRequest = new CarImageRequest();
        imageRequest.setImageUrl("https://example.com/car-image.jpg");

        // Mock car service to return empty
        when(carService.getCarById(carId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = carController.updateCarImage(carId, imageRequest);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
