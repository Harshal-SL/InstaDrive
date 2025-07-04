package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.service.CarService;
import com.alphaweb.instadrive.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarImageController {

    private final CarService carService;
    private final FileStorageService fileStorageService;

    /**
     * Upload an image for a car and update the car's image URL
     *
     * @param id The ID of the car
     * @param file The image file to upload
     * @return A response with the updated car information
     */
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadCarImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        // Check if car exists
        Optional<Car> carOptional = carService.getCarById(id);
        if (carOptional.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Car not found");
            errorResponse.put("carId", id);
            return ResponseEntity.notFound().build();
        }

        // Store the file
        String fileName = fileStorageService.storeFile(file);

        // Create the file download URL
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(fileName)
                .toUriString();

        // Update the car's image URL
        Car car = carOptional.get();
        car.setImageUrl(fileDownloadUri);
        Car updatedCar = carService.addCar(car);

        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("car", updatedCar);
        response.put("fileName", fileName);
        response.put("fileDownloadUri", fileDownloadUri);
        response.put("fileType", file.getContentType());
        response.put("size", file.getSize());

        return ResponseEntity.ok(response);
    }
}
