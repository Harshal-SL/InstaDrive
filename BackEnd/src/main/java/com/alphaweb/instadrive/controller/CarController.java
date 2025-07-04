package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.CarFeaturesRequest;
import com.alphaweb.instadrive.dto.CarImageRequest;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {
    private final CarService carService;
    private final BookingService bookingService;

    @GetMapping
    public List<Car> getAllCars() {
        return carService.getAllCars();
    }

    @GetMapping("/{id}")
    public Optional<Car> getCarById(@PathVariable Long id) {
        return carService.getCarById(id);
    }

    /**
     * Check if a car is available for the given date range
     *
     * @param id The ID of the car to check
     * @param startDate The start date of the period to check (format: yyyy-MM-dd)
     * @param endDate The end date of the period to check (format: yyyy-MM-dd)
     * @return A response indicating whether the car is available
     */
    @GetMapping("/{id}/check-availability")
    public ResponseEntity<Map<String, Object>> checkCarAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        // First check if the car exists
        Optional<Car> carOptional = carService.getCarById(id);
        if (carOptional.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Car not found");
            errorResponse.put("carId", id);
            return ResponseEntity.notFound().build();
        }

        Car car = carOptional.get();
        boolean isAvailable = bookingService.isCarAvailable(id, startDate, endDate);

        Map<String, Object> response = new HashMap<>();
        response.put("carId", id);
        response.put("brand", car.getBrand());
        response.put("model", car.getModel());
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("available", isAvailable);
        response.put("imageUrl", car.getImageUrl());

        // Include car features in the response
        Map<String, Boolean> features = new HashMap<>();
        features.put("airConditioning", car.isAirConditioning());
        features.put("bluetooth", car.isBluetooth());
        features.put("gpsNavigation", car.isGpsNavigation());
        features.put("leatherSeats", car.isLeatherSeats());
        features.put("sunroof", car.isSunroof());
        features.put("backupCamera", car.isBackupCamera());
        features.put("parkingSensors", car.isParkingSensors());
        features.put("keylessEntry", car.isKeylessEntry());
        features.put("heatedSeats", car.isHeatedSeats());
        features.put("appleCarPlay", car.isAppleCarPlay());
        features.put("androidAuto", car.isAndroidAuto());

        response.put("features", features);

        return ResponseEntity.ok(response);
    }

    /**
     * Check car availability (alternative endpoint)
     * @param id Car ID
     * @param startDate Start date
     * @param endDate End date
     * @return Availability status
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return checkCarAvailability(id, startDate, endDate);
    }

    @PostMapping
    public Car addCar(@RequestBody Car car) {
        return carService.addCar(car);
    }

    @PutMapping("/{id}")
    public Car updateCar(@PathVariable Long id, @RequestBody Car car) {
        return carService.updateCar(id, car);
    }

    @DeleteMapping("/{id}")
    public void deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
    }

    /**
     * Update only the features of a car
     *
     * @param id The ID of the car to update
     * @param featuresRequest The features to update
     * @return The updated car
     */
    @PatchMapping("/{id}/features")
    public ResponseEntity<?> updateCarFeatures(@PathVariable Long id, @RequestBody CarFeaturesRequest featuresRequest) {
        Optional<Car> carOptional = carService.getCarById(id);
        if (carOptional.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Car not found");
            errorResponse.put("carId", id);
            return ResponseEntity.notFound().build();
        }

        Car car = carOptional.get();

        // Update only the features
        car.setAirConditioning(featuresRequest.isAirConditioning());
        car.setBluetooth(featuresRequest.isBluetooth());
        car.setGpsNavigation(featuresRequest.isGpsNavigation());
        car.setLeatherSeats(featuresRequest.isLeatherSeats());
        car.setSunroof(featuresRequest.isSunroof());
        car.setBackupCamera(featuresRequest.isBackupCamera());
        car.setParkingSensors(featuresRequest.isParkingSensors());
        car.setKeylessEntry(featuresRequest.isKeylessEntry());
        car.setHeatedSeats(featuresRequest.isHeatedSeats());
        car.setAppleCarPlay(featuresRequest.isAppleCarPlay());
        car.setAndroidAuto(featuresRequest.isAndroidAuto());

        Car updatedCar = carService.addCar(car); // Use addCar to save the updated car

        return ResponseEntity.ok(updatedCar);
    }

    /**
     * Update the image URL of a car
     *
     * @param id The ID of the car to update
     * @param imageRequest The image URL to update
     * @return The updated car
     */
    @PatchMapping("/{id}/image")
    public ResponseEntity<?> updateCarImage(@PathVariable Long id, @RequestBody CarImageRequest imageRequest) {
        Optional<Car> carOptional = carService.getCarById(id);
        if (carOptional.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Car not found");
            errorResponse.put("carId", id);
            return ResponseEntity.notFound().build();
        }

        Car car = carOptional.get();

        // Update only the image URL
        car.setImageUrl(imageRequest.getImageUrl());

        Car updatedCar = carService.addCar(car); // Use addCar to save the updated car

        return ResponseEntity.ok(updatedCar);
    }
}
