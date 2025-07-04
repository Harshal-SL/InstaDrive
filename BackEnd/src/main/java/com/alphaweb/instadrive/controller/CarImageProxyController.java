package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

/**
 * Controller that serves as a proxy for car images
 * This ensures that images are always available, even if the original file is missing
 */
@Controller
@RequestMapping("/api/car-images")
public class CarImageProxyController {

    @Autowired
    private CarRepository carRepository;

    /**
     * Get a car image by car ID
     * @param carId The ID of the car
     * @return The image resource or a placeholder if not found
     */
    @GetMapping("/{carId}")
    public ResponseEntity<Resource> getCarImage(@PathVariable Long carId) {
        try {
            // Find the car
            Optional<Car> carOptional = carRepository.findById(carId);
            if (carOptional.isEmpty()) {
                return serveDefaultImage();
            }

            Car car = carOptional.get();
            String imageUrl = car.getImageUrl();

            // If no image URL is set, return the default image
            if (imageUrl == null || imageUrl.isEmpty()) {
                return serveDefaultImage();
            }

            // Extract the filename from the URL
            String fileName = extractFileName(imageUrl);
            
            // Try to load the file from various locations
            Resource imageResource = tryLoadFromLocations(fileName);
            
            if (imageResource != null && imageResource.exists()) {
                return ResponseEntity.ok()
                        .contentType(getMediaType(fileName))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(imageResource);
            }
            
            // If all else fails, return the default image
            return serveDefaultImage();
        } catch (Exception e) {
            System.err.println("Error serving car image: " + e.getMessage());
            return serveDefaultImage();
        }
    }
    
    /**
     * Extract the filename from a URL
     * @param url The URL
     * @return The filename
     */
    private String extractFileName(String url) {
        try {
            String path = new URL(url).getPath();
            return path.substring(path.lastIndexOf('/') + 1);
        } catch (MalformedURLException e) {
            // If the URL is malformed, just return the last part
            return url.substring(url.lastIndexOf('/') + 1);
        }
    }
    
    /**
     * Try to load a file from various possible locations
     * @param fileName The filename to load
     * @return The resource if found, null otherwise
     */
    private Resource tryLoadFromLocations(String fileName) {
        // Common locations where the file might be stored
        String[] locations = {
            "uploads",
            "./uploads",
            "../uploads",
            System.getProperty("user.home") + "/instadrive-data/uploads",
            System.getProperty("user.home") + "/uploads"
        };
        
        for (String location : locations) {
            try {
                Path filePath = Paths.get(location, fileName).toAbsolutePath().normalize();
                if (Files.exists(filePath)) {
                    return new UrlResource(filePath.toUri());
                }
            } catch (Exception e) {
                // Ignore and try the next location
            }
        }
        
        return null;
    }
    
    /**
     * Serve a default placeholder image
     * @return Response with the default image
     */
    private ResponseEntity<Resource> serveDefaultImage() {
        try {
            // Try to load from classpath
            Resource defaultImage = new ClassPathResource("static/images/car-placeholder.png");
            if (defaultImage.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"car-placeholder.png\"")
                        .body(defaultImage);
            }
            
            // If no placeholder is available, return a 404
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Determine the media type based on the file extension
     * @param fileName The filename
     * @return The media type
     */
    private MediaType getMediaType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "png":
                return MediaType.IMAGE_PNG;
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "gif":
                return MediaType.IMAGE_GIF;
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}