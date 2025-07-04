package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.dto.BookingHistoryResponse;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class BookingHistoryServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CarService carService;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getUserBookingHistory_ReturnsBookingHistoryWithCarDetails() {
        // Arrange
        Long userId = 1L;
        Long carId = 2L;
        
        // Create test bookings
        List<Booking> bookings = new ArrayList<>();
        
        // Past booking
        Booking pastBooking = new Booking();
        pastBooking.setId(1L);
        pastBooking.setCarId(carId);
        pastBooking.setUserId(userId);
        pastBooking.setStartDate(LocalDate.now().minusDays(10));
        pastBooking.setEndDate(LocalDate.now().minusDays(5));
        pastBooking.setTotalAmount(250.0);
        bookings.add(pastBooking);
        
        // Current booking
        Booking currentBooking = new Booking();
        currentBooking.setId(2L);
        currentBooking.setCarId(carId);
        currentBooking.setUserId(userId);
        currentBooking.setStartDate(LocalDate.now().minusDays(2));
        currentBooking.setEndDate(LocalDate.now().plusDays(3));
        currentBooking.setTotalAmount(300.0);
        bookings.add(currentBooking);
        
        // Future booking
        Booking futureBooking = new Booking();
        futureBooking.setId(3L);
        futureBooking.setCarId(carId);
        futureBooking.setUserId(userId);
        futureBooking.setStartDate(LocalDate.now().plusDays(5));
        futureBooking.setEndDate(LocalDate.now().plusDays(10));
        futureBooking.setTotalAmount(350.0);
        bookings.add(futureBooking);
        
        // Create test car
        Car car = new Car();
        car.setId(carId);
        car.setBrand("Toyota");
        car.setModel("Camry");
        
        // Mock repository and service calls
        when(bookingRepository.findByUserIdOrderByStartDateDesc(userId)).thenReturn(bookings);
        when(carService.getCarById(carId)).thenReturn(Optional.of(car));
        
        // Act
        List<BookingHistoryResponse> result = bookingService.getUserBookingHistory(userId);
        
        // Assert
        assertEquals(3, result.size());
        
        // Check past booking
        BookingHistoryResponse pastResponse = result.stream()
                .filter(r -> r.getBookingId().equals(1L))
                .findFirst()
                .orElse(null);
        assertNotNull(pastResponse);
        assertEquals("COMPLETED", pastResponse.getStatus());
        assertEquals(car, pastResponse.getCar());
        
        // Check current booking
        BookingHistoryResponse currentResponse = result.stream()
                .filter(r -> r.getBookingId().equals(2L))
                .findFirst()
                .orElse(null);
        assertNotNull(currentResponse);
        assertEquals("ACTIVE", currentResponse.getStatus());
        assertEquals(car, currentResponse.getCar());
        
        // Check future booking
        BookingHistoryResponse futureResponse = result.stream()
                .filter(r -> r.getBookingId().equals(3L))
                .findFirst()
                .orElse(null);
        assertNotNull(futureResponse);
        assertEquals("UPCOMING", futureResponse.getStatus());
        assertEquals(car, futureResponse.getCar());
    }

    @Test
    void getCurrentAndFutureBookingHistory_ReturnsOnlyCurrentAndFutureBookings() {
        // Arrange
        Long userId = 1L;
        Long carId = 2L;
        LocalDate today = LocalDate.now();
        
        // Create test bookings
        List<Booking> bookings = new ArrayList<>();
        
        // Current booking
        Booking currentBooking = new Booking();
        currentBooking.setId(1L);
        currentBooking.setCarId(carId);
        currentBooking.setUserId(userId);
        currentBooking.setStartDate(today.minusDays(2));
        currentBooking.setEndDate(today.plusDays(3));
        currentBooking.setTotalAmount(300.0);
        
        // Future booking
        Booking futureBooking = new Booking();
        futureBooking.setId(2L);
        futureBooking.setCarId(carId);
        futureBooking.setUserId(userId);
        futureBooking.setStartDate(today.plusDays(5));
        futureBooking.setEndDate(today.plusDays(10));
        futureBooking.setTotalAmount(350.0);
        
        bookings.add(currentBooking);
        bookings.add(futureBooking);
        
        // Create test car
        Car car = new Car();
        car.setId(carId);
        car.setBrand("Toyota");
        car.setModel("Camry");
        
        // Mock repository and service calls
        when(bookingRepository.findCurrentAndFutureBookingsByUserId(eq(userId), any(LocalDate.class))).thenReturn(bookings);
        when(carService.getCarById(carId)).thenReturn(Optional.of(car));
        
        // Act
        List<BookingHistoryResponse> result = bookingService.getCurrentAndFutureBookingHistory(userId);
        
        // Assert
        assertEquals(2, result.size());
        
        // Verify no COMPLETED bookings
        boolean hasCompletedBookings = result.stream()
                .anyMatch(r -> "COMPLETED".equals(r.getStatus()));
        assertFalse(hasCompletedBookings);
        
        // Verify has ACTIVE and UPCOMING bookings
        boolean hasActiveBookings = result.stream()
                .anyMatch(r -> "ACTIVE".equals(r.getStatus()));
        boolean hasUpcomingBookings = result.stream()
                .anyMatch(r -> "UPCOMING".equals(r.getStatus()));
        
        assertTrue(hasActiveBookings);
        assertTrue(hasUpcomingBookings);
    }

    @Test
    void getPastBookingHistory_ReturnsOnlyPastBookings() {
        // Arrange
        Long userId = 1L;
        Long carId = 2L;
        LocalDate today = LocalDate.now();
        
        // Create test bookings
        List<Booking> bookings = new ArrayList<>();
        
        // Past booking 1
        Booking pastBooking1 = new Booking();
        pastBooking1.setId(1L);
        pastBooking1.setCarId(carId);
        pastBooking1.setUserId(userId);
        pastBooking1.setStartDate(today.minusDays(10));
        pastBooking1.setEndDate(today.minusDays(5));
        pastBooking1.setTotalAmount(250.0);
        
        // Past booking 2
        Booking pastBooking2 = new Booking();
        pastBooking2.setId(2L);
        pastBooking2.setCarId(carId);
        pastBooking2.setUserId(userId);
        pastBooking2.setStartDate(today.minusDays(20));
        pastBooking2.setEndDate(today.minusDays(15));
        pastBooking2.setTotalAmount(300.0);
        
        bookings.add(pastBooking1);
        bookings.add(pastBooking2);
        
        // Create test car
        Car car = new Car();
        car.setId(carId);
        car.setBrand("Toyota");
        car.setModel("Camry");
        
        // Mock repository and service calls
        when(bookingRepository.findPastBookingsByUserId(eq(userId), any(LocalDate.class))).thenReturn(bookings);
        when(carService.getCarById(carId)).thenReturn(Optional.of(car));
        
        // Act
        List<BookingHistoryResponse> result = bookingService.getPastBookingHistory(userId);
        
        // Assert
        assertEquals(2, result.size());
        
        // Verify all bookings are COMPLETED
        boolean allCompleted = result.stream()
                .allMatch(r -> "COMPLETED".equals(r.getStatus()));
        assertTrue(allCompleted);
    }
}
