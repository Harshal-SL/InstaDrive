package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void isCarAvailable_NoOverlappingBookings_ReturnsTrue() {
        // Arrange
        Long carId = 1L;
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 6, 5);
        
        // No overlapping bookings
        when(bookingRepository.findOverlappingBookings(eq(carId), eq(startDate), eq(endDate)))
                .thenReturn(new ArrayList<>());
        
        // Act
        boolean result = bookingService.isCarAvailable(carId, startDate, endDate);
        
        // Assert
        assertTrue(result);
    }

    @Test
    void isCarAvailable_WithOverlappingBookings_ReturnsFalse() {
        // Arrange
        Long carId = 1L;
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 6, 5);
        
        // Create an overlapping booking
        List<Booking> overlappingBookings = new ArrayList<>();
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setCarId(carId);
        booking.setStartDate(LocalDate.of(2023, 6, 3));
        booking.setEndDate(LocalDate.of(2023, 6, 7));
        overlappingBookings.add(booking);
        
        when(bookingRepository.findOverlappingBookings(eq(carId), eq(startDate), eq(endDate)))
                .thenReturn(overlappingBookings);
        
        // Act
        boolean result = bookingService.isCarAvailable(carId, startDate, endDate);
        
        // Assert
        assertFalse(result);
    }

    @Test
    void isCarAvailableExcludingBooking_NoOtherOverlappingBookings_ReturnsTrue() {
        // Arrange
        Long carId = 1L;
        Long bookingId = 1L;
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 6, 5);
        
        // Create a list with only the booking to exclude
        List<Booking> bookings = new ArrayList<>();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setCarId(carId);
        booking.setStartDate(LocalDate.of(2023, 6, 1));
        booking.setEndDate(LocalDate.of(2023, 6, 5));
        bookings.add(booking);
        
        when(bookingRepository.findOverlappingBookings(eq(carId), eq(startDate), eq(endDate)))
                .thenReturn(bookings);
        
        // Act
        boolean result = bookingService.isCarAvailableExcludingBooking(carId, startDate, endDate, bookingId);
        
        // Assert
        assertTrue(result);
    }

    @Test
    void isCarAvailableExcludingBooking_WithOtherOverlappingBookings_ReturnsFalse() {
        // Arrange
        Long carId = 1L;
        Long bookingId = 1L;
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 6, 5);
        
        // Create a list with the booking to exclude and another overlapping booking
        List<Booking> bookings = new ArrayList<>();
        
        Booking booking1 = new Booking();
        booking1.setId(bookingId);
        booking1.setCarId(carId);
        booking1.setStartDate(LocalDate.of(2023, 6, 1));
        booking1.setEndDate(LocalDate.of(2023, 6, 5));
        bookings.add(booking1);
        
        Booking booking2 = new Booking();
        booking2.setId(2L);
        booking2.setCarId(carId);
        booking2.setStartDate(LocalDate.of(2023, 6, 3));
        booking2.setEndDate(LocalDate.of(2023, 6, 7));
        bookings.add(booking2);
        
        when(bookingRepository.findOverlappingBookings(eq(carId), eq(startDate), eq(endDate)))
                .thenReturn(bookings);
        
        // Act
        boolean result = bookingService.isCarAvailableExcludingBooking(carId, startDate, endDate, bookingId);
        
        // Assert
        assertFalse(result);
    }

    @Test
    void addBooking_CarAvailable_SavesBooking() {
        // Arrange
        Long carId = 1L;
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 6, 5);
        
        Booking booking = new Booking();
        booking.setCarId(carId);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        
        // No overlapping bookings
        when(bookingRepository.findOverlappingBookings(eq(carId), eq(startDate), eq(endDate)))
                .thenReturn(new ArrayList<>());
        
        // Mock save
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        
        // Act
        Booking result = bookingService.addBooking(booking);
        
        // Assert
        assertNotNull(result);
        assertEquals(booking, result);
    }

    @Test
    void addBooking_CarNotAvailable_ReturnsNull() {
        // Arrange
        Long carId = 1L;
        LocalDate startDate = LocalDate.of(2023, 6, 1);
        LocalDate endDate = LocalDate.of(2023, 6, 5);
        
        Booking booking = new Booking();
        booking.setCarId(carId);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        
        // Create an overlapping booking
        List<Booking> overlappingBookings = new ArrayList<>();
        Booking existingBooking = new Booking();
        existingBooking.setId(1L);
        existingBooking.setCarId(carId);
        existingBooking.setStartDate(LocalDate.of(2023, 6, 3));
        existingBooking.setEndDate(LocalDate.of(2023, 6, 7));
        overlappingBookings.add(existingBooking);
        
        when(bookingRepository.findOverlappingBookings(eq(carId), eq(startDate), eq(endDate)))
                .thenReturn(overlappingBookings);
        
        // Act
        Booking result = bookingService.addBooking(booking);
        
        // Assert
        assertNull(result);
    }
}
