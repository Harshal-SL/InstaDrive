package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.dto.AdminDashboardBookingDTO;
import com.alphaweb.instadrive.dto.BookingHistoryResponse;
import com.alphaweb.instadrive.dto.BookingResponseDTO;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
// Removed unused cache annotations
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
// Removed unused import
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final CarService carService;
    private final UserService userService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    /**
     * Add a new booking after checking if the car is available for the requested dates
     *
     * @param booking The booking to add
     * @return The saved booking if the car is available, null otherwise
     */
    public Booking addBooking(Booking booking) {
        // Check if the car is available for the requested dates
        if (isCarAvailable(booking.getCarId(), booking.getStartDate(), booking.getEndDate())) {
            // Generate a unique reference ID
            String referenceId = generateUniqueReferenceId();
            booking.setReferenceId(referenceId);

            // Set initial status
            booking.setStatus("CONFIRMED");

            return bookingRepository.save(booking);
        }
        return null; // Car is not available for the requested dates
    }

    /**
     * Generate a unique booking reference ID
     * Format: ID-YYYYMMDD-XXXX (where XXXX is a random alphanumeric string)
     *
     * @return A unique booking reference ID
     */
    private String generateUniqueReferenceId() {
        // Get current date in YYYYMMDD format
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Generate a random 4-character alphanumeric string
        String randomPart = generateRandomAlphanumeric(4);

        // Combine parts to create the reference ID
        return "ID-" + datePart + "-" + randomPart;
    }

    /**
     * Generate a random alphanumeric string of the specified length
     *
     * @param length The length of the string to generate
     * @return A random alphanumeric string
     */
    private String generateRandomAlphanumeric(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        return sb.toString();
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();

            // Check if the car is available for the new dates (if they changed)
            if (!booking.getStartDate().equals(bookingDetails.getStartDate()) ||
                !booking.getEndDate().equals(bookingDetails.getEndDate()) ||
                !booking.getCarId().equals(bookingDetails.getCarId())) {

                // If dates or car changed, check availability (excluding this booking)
                if (!isCarAvailableExcludingBooking(bookingDetails.getCarId(),
                                                  bookingDetails.getStartDate(),
                                                  bookingDetails.getEndDate(),
                                                  id)) {
                    return null; // Car is not available for the new dates
                }
            }

            booking.setCarId(bookingDetails.getCarId());
            booking.setUserId(bookingDetails.getUserId());
            booking.setStartDate(bookingDetails.getStartDate());
            booking.setEndDate(bookingDetails.getEndDate());
            booking.setTotalAmount(bookingDetails.getTotalAmount());

            // Update status if provided
            if (bookingDetails.getStatus() != null && !bookingDetails.getStatus().isEmpty()) {
                booking.setStatus(bookingDetails.getStatus());
            }

            // Preserve the reference ID (don't update it)
            return bookingRepository.save(booking);
        }
        return null; // Or handle with custom exception
    }

    /**
     * Check if a car is available for the given date range
     *
     * @param carId The ID of the car to check
     * @param startDate The start date of the period to check
     * @param endDate The end date of the period to check
     * @return true if the car is available, false otherwise
     */
    public boolean isCarAvailable(Long carId, LocalDate startDate, LocalDate endDate) {
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(carId, startDate, endDate);
        return overlappingBookings.isEmpty();
    }

    /**
     * Check if a car is available for the given date range, excluding a specific booking
     * This is useful when updating a booking
     *
     * @param carId The ID of the car to check
     * @param startDate The start date of the period to check
     * @param endDate The end date of the period to check
     * @param excludeBookingId The ID of the booking to exclude from the check
     * @return true if the car is available, false otherwise
     */
    public boolean isCarAvailableExcludingBooking(Long carId, LocalDate startDate, LocalDate endDate, Long excludeBookingId) {
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(carId, startDate, endDate);
        // Filter out the booking with the given ID
        overlappingBookings = overlappingBookings.stream()
                .filter(booking -> !booking.getId().equals(excludeBookingId))
                .toList();
        return overlappingBookings.isEmpty();
    }

    /**
     * Get all bookings for a specific user
     *
     * @param userId The ID of the user
     * @return List of bookings made by the user
     */
    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    /**
     * Get current and future bookings for a specific user
     *
     * @param userId The ID of the user
     * @return List of current and future bookings
     */
    public List<Booking> getCurrentAndFutureBookings(Long userId) {
        return bookingRepository.findCurrentAndFutureBookingsByUserId(userId, LocalDate.now());
    }

    /**
     * Get past bookings for a specific user
     *
     * @param userId The ID of the user
     * @return List of past bookings
     */
    public List<Booking> getPastBookings(Long userId) {
        return bookingRepository.findPastBookingsByUserId(userId, LocalDate.now());
    }

    /**
     * Get booking history for a specific user with car details
     *
     * @param userId The ID of the user
     * @return List of booking history responses with car details
     */
    public List<BookingHistoryResponse> getUserBookingHistory(Long userId) {
        List<Booking> bookings = getUserBookings(userId);
        return convertToBookingHistoryResponse(bookings);
    }

    /**
     * Get current and future bookings for a specific user with car details
     *
     * @param userId The ID of the user
     * @return List of booking history responses with car details
     */
    public List<BookingHistoryResponse> getCurrentAndFutureBookingHistory(Long userId) {
        List<Booking> bookings = getCurrentAndFutureBookings(userId);
        return convertToBookingHistoryResponse(bookings);
    }

    /**
     * Get past bookings for a specific user with car details
     *
     * @param userId The ID of the user
     * @return List of booking history responses with car details
     */
    public List<BookingHistoryResponse> getPastBookingHistory(Long userId) {
        List<Booking> bookings = getPastBookings(userId);
        return convertToBookingHistoryResponse(bookings);
    }

    /**
     * Convert a list of bookings to booking history responses with car details
     *
     * @param bookings The list of bookings to convert
     * @return List of booking history responses with car details
     */
    private List<BookingHistoryResponse> convertToBookingHistoryResponse(List<Booking> bookings) {
        List<BookingHistoryResponse> responses = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Booking booking : bookings) {
            BookingHistoryResponse response = new BookingHistoryResponse();
            response.setBookingId(booking.getId());
            response.setReferenceId(booking.getReferenceId());
            response.setStartDate(booking.getStartDate());
            response.setEndDate(booking.getEndDate());
            response.setTotalAmount(booking.getTotalAmount());

            // Get car details
            Optional<Car> carOptional = carService.getCarById(booking.getCarId());
            carOptional.ifPresent(response::setCar);

            // Use booking status if available, otherwise determine based on dates
            if (booking.getStatus() != null && !booking.getStatus().isEmpty()) {
                response.setStatus(booking.getStatus());
            } else {
                // Determine booking status based on dates
                if (booking.getEndDate().isBefore(today)) {
                    response.setStatus("COMPLETED");
                } else if (booking.getStartDate().isAfter(today)) {
                    response.setStatus("UPCOMING");
                } else {
                    response.setStatus("ACTIVE");
                }
            }

            responses.add(response);
        }

        return responses;
    }

    /**
     * Convert a booking to a detailed response DTO
     *
     * @param booking The booking to convert
     * @return The booking response DTO
     */
    public BookingResponseDTO convertToBookingResponseDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        LocalDate today = LocalDate.now();

        // Set basic booking information
        dto.setId(booking.getId());
        dto.setReferenceId(booking.getReferenceId());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setTotalAmount(booking.getTotalAmount());

        // Set user information
        dto.setUserId(booking.getUserId());
        Optional<User> userOptional = userService.getUserById(booking.getUserId());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            dto.setUserName(user.getName());
            dto.setUserEmail(user.getEmail());
        }

        // Set car information
        dto.setCarId(booking.getCarId());
        Optional<Car> carOptional = carService.getCarById(booking.getCarId());
        if (carOptional.isPresent()) {
            Car car = carOptional.get();
            dto.setCarBrand(car.getBrand());
            dto.setCarModel(car.getModel());
            dto.setCarRegistrationNumber(car.getRegistrationNumber());
        }

        // Determine status
        String status;
        if (booking.getStatus() != null && !booking.getStatus().isEmpty()) {
            status = booking.getStatus();
        } else {
            // Determine status based on dates
            if (booking.getEndDate().isBefore(today)) {
                status = "COMPLETED";
            } else if (booking.getStartDate().isAfter(today)) {
                status = "UPCOMING";
            } else {
                status = "ACTIVE";
            }
        }
        dto.setStatus(status);

        // Determine if booking is active
        boolean isActive = "ACTIVE".equals(status) ||
                          ("CONFIRMED".equals(status) &&
                           !booking.getStartDate().isAfter(today) &&
                           !booking.getEndDate().isBefore(today));
        dto.setActive(isActive);

        return dto;
    }

    /**
     * Convert a list of bookings to detailed response DTOs
     *
     * @param bookings The list of bookings to convert
     * @return The list of booking response DTOs
     */
    public List<BookingResponseDTO> convertToBookingResponseDTOs(List<Booking> bookings) {
        return bookings.stream()
                .map(this::convertToBookingResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings with detailed information for admin dashboard
     *
     * @return List of admin dashboard booking DTOs
     */
    public List<AdminDashboardBookingDTO> getAdminDashboardBookings() {
        List<Booking> bookings = getAllBookings();
        return convertToAdminDashboardBookingDTOs(bookings);
    }

    /**
     * Convert a list of bookings to admin dashboard booking DTOs
     *
     * @param bookings The list of bookings to convert
     * @return List of admin dashboard booking DTOs
     */
    private List<AdminDashboardBookingDTO> convertToAdminDashboardBookingDTOs(List<Booking> bookings) {
        List<AdminDashboardBookingDTO> dtos = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Booking booking : bookings) {
            AdminDashboardBookingDTO dto = new AdminDashboardBookingDTO();

            // Set booking information
            dto.setBookingId(booking.getId());
            dto.setReferenceId(booking.getReferenceId());
            dto.setStartDate(booking.getStartDate());
            dto.setEndDate(booking.getEndDate());
            dto.setAmount(booking.getTotalAmount());

            // Set booking date (using the reference ID date part)
            if (booking.getReferenceId() != null && booking.getReferenceId().length() >= 11) {
                String datePart = booking.getReferenceId().substring(3, 11); // Extract YYYYMMDD
                try {
                    LocalDate bookingDate = LocalDate.parse(datePart, DateTimeFormatter.ofPattern("yyyyMMdd"));
                    dto.setBookingDate(bookingDate);
                } catch (Exception e) {
                    // If parsing fails, use start date as fallback
                    dto.setBookingDate(booking.getStartDate());
                }
            } else {
                // If reference ID is not in expected format, use start date as fallback
                dto.setBookingDate(booking.getStartDate());
            }

            // Set user information
            Long userId = booking.getUserId();
            dto.setUserId(userId);
            if (userId != null) {
                Optional<User> userOptional = userService.getUserById(userId);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    dto.setUserName(user.getName());
                    dto.setUserEmail(user.getEmail());
                    dto.setUserIdString(user.getUserId()); // Set the unique user identifier string
                } else {
                    // Set default values if user not found
                    dto.setUserName("Guest Customer");
                    dto.setUserEmail("guest@example.com");
                    dto.setUserIdString("GUEST-" + UUID.randomUUID().toString().substring(0, 8));
                }
            } else {
                // Set default values for null userId
                dto.setUserName("Guest Customer");
                dto.setUserEmail("guest@example.com");
                dto.setUserIdString("GUEST-" + UUID.randomUUID().toString().substring(0, 8));
            }

            // Set car information
            Long carId = booking.getCarId();
            dto.setCarId(carId);
            if (carId != null) {
                Optional<Car> carOptional = carService.getCarById(carId);
                if (carOptional.isPresent()) {
                    Car car = carOptional.get();
                    dto.setCarBrand(car.getBrand());
                    dto.setCarModel(car.getModel());
                    dto.setCarRegistrationNumber(car.getRegistrationNumber());
                } else {
                    // Set default values if car not found
                    dto.setCarBrand("Default Brand");
                    dto.setCarModel("Default Model");
                    dto.setCarRegistrationNumber("DEFAULT-" + UUID.randomUUID().toString().substring(0, 8));
                }
            } else {
                // Set default values for null carId
                dto.setCarBrand("Default Brand");
                dto.setCarModel("Default Model");
                dto.setCarRegistrationNumber("DEFAULT-" + UUID.randomUUID().toString().substring(0, 8));
            }

            // Set status
            if (booking.getStatus() != null && !booking.getStatus().isEmpty()) {
                dto.setStatus(booking.getStatus());
            } else {
                // Determine status based on dates
                if (booking.getEndDate().isBefore(today)) {
                    dto.setStatus("COMPLETED");
                } else if (booking.getStartDate().isAfter(today)) {
                    dto.setStatus("UPCOMING");
                } else {
                    dto.setStatus("ACTIVE");
                }
            }

            dtos.add(dto);
        }

        return dtos;
    }

    /**
     * Update expired bookings to COMPLETED status
     * This method should be called periodically to check for bookings that have passed their end date
     *
     * @return Number of bookings updated
     */
    public int updateExpiredBookings() {
        LocalDate today = LocalDate.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(today);

        int updatedCount = 0;
        for (Booking booking : expiredBookings) {
            if (!"COMPLETED".equals(booking.getStatus()) && !"CANCELLED".equals(booking.getStatus())) {
                booking.setStatus("COMPLETED");
                bookingRepository.save(booking);
                updatedCount++;
            }
        }

        return updatedCount;
    }

    /**
     * Update booking status
     *
     * @param id Booking ID
     * @param status New status
     * @return Updated booking or null if not found
     */
    public Booking updateBookingStatus(Long id, String status) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            booking.setStatus(status);
            return bookingRepository.save(booking);
        }
        return null;
    }

    /**
     * Cancel a booking
     *
     * @param id Booking ID
     * @return true if cancelled successfully, false otherwise
     */
    public boolean cancelBooking(Long id) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();

            // Check if booking can be cancelled
            if ("CANCELLED".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
                return false;
            }

            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
            return true;
        }
        return false;
    }

    /**
     * Return a car (complete the booking)
     *
     * @param id Booking ID
     * @return true if returned successfully, false otherwise
     */
    public boolean returnCar(Long id) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();

            // Check if booking can be completed
            if ("CANCELLED".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
                return false;
            }

            booking.setStatus("COMPLETED");
            bookingRepository.save(booking);
            return true;
        }
        return false;
    }


}
