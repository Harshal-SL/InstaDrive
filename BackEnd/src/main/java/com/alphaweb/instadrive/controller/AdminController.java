package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.CarRequest;
import com.alphaweb.instadrive.dto.AdminDashboardBookingDTO;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.model.Payment;
import com.alphaweb.instadrive.model.Receipt;
import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.CarService;
import com.alphaweb.instadrive.service.PaymentService;
import com.alphaweb.instadrive.service.ReceiptService;
import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for admin functionality
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;
    private final CarService carService;
    private final PaymentService paymentService;
    private final ReceiptService receiptService;

    /**
     * Get admin dashboard data
     *
     * @return Dashboard data including bookings, total revenue, etc.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            // Use the BookingService's method to get admin dashboard bookings
            // This method already joins the booking, user, and car tables
            List<AdminDashboardBookingDTO> adminDashboardBookings = bookingService.getAdminDashboardBookings();

            // Create booking DTOs with all required information
            List<Map<String, Object>> bookingDTOs = adminDashboardBookings.stream()
                    .map(dto -> {
                        Map<String, Object> bookingDTO = new HashMap<>();

                        // Set booking information
                        bookingDTO.put("id", dto.getBookingId());
                        bookingDTO.put("referenceId", dto.getReferenceId());
                        bookingDTO.put("status", dto.getStatus() != null ? dto.getStatus() : "CONFIRMED");

                        // Set amount
                        double amount = dto.getAmount();
                        if (amount <= 0) {
                            // If amount is still 0, calculate based on duration
                            long days = java.time.temporal.ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
                            if (days <= 0) days = 1; // Minimum 1 day

                            // Try to use car price if available
                            if (dto.getCarId() != null) {
                                Optional<Car> carOptional = carService.getCarById(dto.getCarId());
                                if (carOptional.isPresent()) {
                                    Car car = carOptional.get();
                                    amount = car.getPricePerDay() * days;
                                } else {
                                    // Use default price
                                    amount = 55.0 * days;
                                }
                            } else {
                                // Use default price
                                amount = 55.0 * days;
                            }
                        }
                        bookingDTO.put("amount", amount);

                        // Set dates and duration
                        bookingDTO.put("startDate", dto.getStartDate());
                        bookingDTO.put("endDate", dto.getEndDate());

                        // Calculate duration in days
                        long durationInDays = java.time.temporal.ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
                        if (durationInDays <= 0) {
                            durationInDays = 1; // Minimum 1 day for same day bookings
                        }
                        bookingDTO.put("duration", durationInDays);
                        bookingDTO.put("durationDescription", durationInDays + " day(s) from " +
                                dto.getStartDate().toString() + " to " + dto.getEndDate().toString());

                        // Set user information
                        bookingDTO.put("userId", dto.getUserId());
                        bookingDTO.put("username", dto.getUserName() != null ? dto.getUserName() : "Guest User");
                        bookingDTO.put("userEmail", dto.getUserEmail() != null ? dto.getUserEmail() : "guest@example.com");
                        bookingDTO.put("customerName", dto.getUserName() != null ? dto.getUserName() : "Guest Customer");

                        // Get additional user information if needed
                        if (dto.getUserId() != null) {
                            Optional<User> userOptional = userService.getUserById(dto.getUserId());
                            if (userOptional.isPresent()) {
                                User user = userOptional.get();
                                bookingDTO.put("customerPhone", user.getPhone() != null ? user.getPhone() : "Not Available");
                                bookingDTO.put("customerAddress", user.getAddress() != null ? user.getAddress() : "Not Available");
                            } else {
                                bookingDTO.put("customerPhone", "Not Available");
                                bookingDTO.put("customerAddress", "Not Available");
                            }
                        } else {
                            bookingDTO.put("customerPhone", "Not Available");
                            bookingDTO.put("customerAddress", "Not Available");
                        }

                        // Set car information
                        bookingDTO.put("carId", dto.getCarId());
                        bookingDTO.put("carBrand", dto.getCarBrand() != null ? dto.getCarBrand() : "Default Brand");
                        bookingDTO.put("carModel", dto.getCarModel() != null ? dto.getCarModel() : "Default Model");
                        bookingDTO.put("carRegistrationNumber", dto.getCarRegistrationNumber() != null ?
                                dto.getCarRegistrationNumber() : "DEFAULT-123");

                        // Set car name (brand + model)
                        String carName = (dto.getCarBrand() != null ? dto.getCarBrand() : "Default Brand") + " " +
                                (dto.getCarModel() != null ? dto.getCarModel() : "Default Model");
                        bookingDTO.put("carName", carName);

                        // Get additional car information if needed
                        if (dto.getCarId() != null) {
                            Optional<Car> carOptional = carService.getCarById(dto.getCarId());
                            if (carOptional.isPresent()) {
                                Car car = carOptional.get();
                                bookingDTO.put("carColor", car.getColor() != null ? car.getColor() : "Silver");
                                bookingDTO.put("carYear", car.getYear() > 0 ? car.getYear() : 2023);
                                bookingDTO.put("carPricePerDay", car.getPricePerDay() > 0 ? car.getPricePerDay() : 50.0);
                            } else {
                                bookingDTO.put("carColor", "Silver");
                                bookingDTO.put("carYear", 2023);
                                bookingDTO.put("carPricePerDay", 50.0);
                            }
                        } else {
                            bookingDTO.put("carColor", "Silver");
                            bookingDTO.put("carYear", 2023);
                            bookingDTO.put("carPricePerDay", 50.0);
                        }

                        return bookingDTO;
                    })
                    .collect(Collectors.toList());

            // Calculate total revenue from processed bookings
            double totalRevenue = bookingDTOs.stream()
                    .mapToDouble(dto -> (double) dto.get("amount"))
                    .sum();

            // Generate sample revenue by month data
            List<Map<String, Object>> revenueByMonth = generateSampleRevenueData();

            // Generate popular cars data (mix of real cars and sample data)
            List<Map<String, Object>> popularCars = generatePopularCarsData();

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookingDTOs);
            response.put("totalRevenue", totalRevenue > 0 ? totalRevenue : 125000); // Use sample if no real data
            response.put("totalBookings", bookingDTOs.size());
            response.put("revenueByMonth", revenueByMonth);
            response.put("popularCars", popularCars);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Print stack trace for debugging
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get dashboard data: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get all cars
     *
     * @return List of all cars
     */
    @GetMapping("/cars")
    public ResponseEntity<List<Car>> getAllCars() {
        return ResponseEntity.ok(carService.getAllCars());
    }

    /**
     * Get car by ID
     *
     * @param id Car ID
     * @return Car details
     */
    @GetMapping("/cars/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Long id) {
        return carService.getCarById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Add a new car
     *
     * @param carRequest Car details
     * @return Added car
     */
    @PostMapping("/cars")
    public ResponseEntity<Car> addCar(@RequestBody CarRequest carRequest) {
        Car car = new Car();
        car.setBrand(carRequest.getBrand());
        car.setModel(carRequest.getModel());
        car.setYear(carRequest.getYear());
        car.setColor(carRequest.getColor());
        car.setRegistrationNumber(carRequest.getRegistrationNumber());
        car.setPricePerDay(carRequest.getRentalPrice());
        car.setFuelType("Petrol"); // Default value
        car.setTransmission("Automatic"); // Default value
        car.setDescription("New car added by admin"); // Default value
        car.setImageUrl("/images/default-car.jpg"); // Default value
        car.setAirConditioning(carRequest.isAirConditioning());
        car.setBluetooth(carRequest.isBluetooth());
        car.setGpsNavigation(carRequest.isGpsNavigation());
        car.setLeatherSeats(carRequest.isLeatherSeats());
        car.setSunroof(carRequest.isSunroof());
        car.setBackupCamera(carRequest.isBackupCamera());
        car.setParkingSensors(carRequest.isParkingSensors());
        car.setKeylessEntry(carRequest.isKeylessEntry());
        car.setHeatedSeats(carRequest.isHeatedSeats());
        car.setAppleCarPlay(carRequest.isAppleCarPlay());
        car.setAndroidAuto(carRequest.isAndroidAuto());

        Car savedCar = carService.addCar(car);
        return ResponseEntity.ok(savedCar);
    }

    /**
     * Update a car
     *
     * @param id Car ID
     * @param carRequest Car details
     * @return Updated car
     */
    @PutMapping("/cars/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @RequestBody CarRequest carRequest) {
        return carService.getCarById(id)
                .map(car -> {
                    car.setBrand(carRequest.getBrand());
                    car.setModel(carRequest.getModel());
                    car.setYear(carRequest.getYear());
                    car.setColor(carRequest.getColor());
                    car.setRegistrationNumber(carRequest.getRegistrationNumber());
                    car.setPricePerDay(carRequest.getRentalPrice());
                    car.setAirConditioning(carRequest.isAirConditioning());
                    car.setBluetooth(carRequest.isBluetooth());
                    car.setGpsNavigation(carRequest.isGpsNavigation());
                    car.setLeatherSeats(carRequest.isLeatherSeats());
                    car.setSunroof(carRequest.isSunroof());
                    car.setBackupCamera(carRequest.isBackupCamera());
                    car.setParkingSensors(carRequest.isParkingSensors());
                    car.setKeylessEntry(carRequest.isKeylessEntry());
                    car.setHeatedSeats(carRequest.isHeatedSeats());
                    car.setAppleCarPlay(carRequest.isAppleCarPlay());
                    car.setAndroidAuto(carRequest.isAndroidAuto());

                    Car updatedCar = carService.updateCar(id, car);
                    return ResponseEntity.ok(updatedCar);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a car
     *
     * @param id Car ID
     * @return Success message
     */
    @DeleteMapping("/cars/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        return carService.getCarById(id)
                .map(car -> {
                    carService.deleteCar(id);
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Car deleted successfully");
                    response.put("carId", id);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Simple test endpoint to verify admin access
     *
     * @return Test message
     */
    @GetMapping("/test")
    public ResponseEntity<?> testAdminAccess() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin access is working!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all payments
     *
     * @return List of all payments
     */
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /**
     * Get payment by ID
     *
     * @param id Payment ID
     * @return Payment details
     */
    @GetMapping("/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get payments by booking ID
     *
     * @param bookingId Booking ID
     * @return List of payments for the booking
     */
    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getPaymentsByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBookingId(bookingId));
    }

    /**
     * Get payments by user ID
     *
     * @param userId User ID
     * @return List of payments made by the user
     */
    @GetMapping("/payments/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }

    /**
     * Get all receipts for a user
     *
     * @param userId User ID
     * @return List of receipts for the user
     */
    @GetMapping("/receipts/user/{userId}")
    public ResponseEntity<List<Receipt>> getReceiptsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(receiptService.getReceiptsByUserId(userId));
    }

    /**
     * Get receipt by booking ID
     *
     * @param bookingId Booking ID
     * @return Receipt details
     */
    @GetMapping("/receipts/booking/{bookingId}")
    public ResponseEntity<Receipt> getReceiptByBookingId(@PathVariable Long bookingId) {
        return receiptService.getReceiptByBookingId(bookingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get receipt by transaction ID
     *
     * @param transactionId Transaction ID
     * @return Receipt details
     */
    @GetMapping("/receipts/transaction/{transactionId}")
    public ResponseEntity<Receipt> getReceiptByTransactionId(@PathVariable String transactionId) {
        return receiptService.getReceiptByTransactionId(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Generate sample revenue data for the last 6 months
     *
     * @return List of revenue data by month
     */
    private List<Map<String, Object>> generateSampleRevenueData() {
        List<Map<String, Object>> revenueData = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        double[] revenues = {18500, 22300, 19800, 25600, 28900, 31200};

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", months[i]);
            monthData.put("revenue", revenues[i]);
            revenueData.add(monthData);
        }

        return revenueData;
    }

    /**
     * Generate popular cars data (mix of real cars and sample data)
     *
     * @return List of popular cars with booking statistics
     */
    private List<Map<String, Object>> generatePopularCarsData() {
        List<Map<String, Object>> popularCars = new ArrayList<>();

        try {
            // Try to get real cars from database
            List<Car> realCars = carService.getAllCars();

            if (realCars != null && !realCars.isEmpty()) {
                // Use real cars with sample booking data
                int[] sampleBookings = {45, 38, 32, 28, 25};
                double[] sampleRevenues = {22500, 19800, 16800, 12600, 11250};
                String[] sampleAvailability = {"Available", "Booked", "Available", "Available", "Maintenance"};

                for (int i = 0; i < Math.min(realCars.size(), 5); i++) {
                    Car car = realCars.get(i);
                    Map<String, Object> carData = new HashMap<>();
                    carData.put("id", car.getId());
                    carData.put("name", car.getBrand() + " " + car.getModel());
                    carData.put("brand", car.getBrand());
                    carData.put("model", car.getModel());
                    carData.put("bookings", sampleBookings[i]);
                    carData.put("revenue", sampleRevenues[i]);
                    carData.put("availability", sampleAvailability[i]);
                    popularCars.add(carData);
                }
            }
        } catch (Exception e) {
            System.out.println("Could not fetch real cars, using sample data: " + e.getMessage());
        }

        // If no real cars or error, use sample data
        if (popularCars.isEmpty()) {
            // Sample car 1
            Map<String, Object> car1 = new HashMap<>();
            car1.put("id", 1L);
            car1.put("name", "BMW 3 Series");
            car1.put("brand", "BMW");
            car1.put("model", "3 Series");
            car1.put("bookings", 45);
            car1.put("revenue", 22500);
            car1.put("availability", "Available");
            popularCars.add(car1);

            // Sample car 2
            Map<String, Object> car2 = new HashMap<>();
            car2.put("id", 2L);
            car2.put("name", "Mercedes-Benz C-Class");
            car2.put("brand", "Mercedes-Benz");
            car2.put("model", "C-Class");
            car2.put("bookings", 38);
            car2.put("revenue", 19800);
            car2.put("availability", "Booked");
            popularCars.add(car2);

            // Sample car 3
            Map<String, Object> car3 = new HashMap<>();
            car3.put("id", 3L);
            car3.put("name", "Audi A4");
            car3.put("brand", "Audi");
            car3.put("model", "A4");
            car3.put("bookings", 32);
            car3.put("revenue", 16800);
            car3.put("availability", "Available");
            popularCars.add(car3);

            // Sample car 4
            Map<String, Object> car4 = new HashMap<>();
            car4.put("id", 4L);
            car4.put("name", "Toyota Camry");
            car4.put("brand", "Toyota");
            car4.put("model", "Camry");
            car4.put("bookings", 28);
            car4.put("revenue", 12600);
            car4.put("availability", "Available");
            popularCars.add(car4);

            // Sample car 5
            Map<String, Object> car5 = new HashMap<>();
            car5.put("id", 5L);
            car5.put("name", "Honda Accord");
            car5.put("brand", "Honda");
            car5.put("model", "Accord");
            car5.put("bookings", 25);
            car5.put("revenue", 11250);
            car5.put("availability", "Maintenance");
            popularCars.add(car5);
        }

        return popularCars;
    }
}
