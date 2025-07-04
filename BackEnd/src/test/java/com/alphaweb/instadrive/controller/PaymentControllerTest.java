package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.CardPaymentRequest;
import com.alphaweb.instadrive.dto.PaymentResponse;
import com.alphaweb.instadrive.dto.UpiPaymentRequest;
import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.service.BookingService;
import com.alphaweb.instadrive.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void processBookingUpiPayment_Success() {
        // Arrange
        Long bookingId = 1L;
        UpiPaymentRequest request = new UpiPaymentRequest();
        request.setUpiId("test@upi");
        request.setAmount(100.0);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setUserId(2L);
        booking.setTotalAmount(100.0);

        PaymentResponse expectedResponse = new PaymentResponse();
        expectedResponse.setStatus("Success");
        expectedResponse.setTransactionId("UPI-12345678");

        when(bookingService.getBookingById(bookingId)).thenReturn(Optional.of(booking));
        when(paymentService.processUpiPayment(any(UpiPaymentRequest.class))).thenReturn(expectedResponse);

        // Act
        ResponseEntity<?> response = paymentController.processBookingUpiPayment(bookingId, request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    void processBookingUpiPayment_BookingNotFound() {
        // Arrange
        Long bookingId = 1L;
        UpiPaymentRequest request = new UpiPaymentRequest();
        request.setUpiId("test@upi");

        when(bookingService.getBookingById(bookingId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = paymentController.processBookingUpiPayment(bookingId, request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Booking not found"));
    }

    @Test
    void processBookingCardPayment_Success() {
        // Arrange
        Long bookingId = 1L;
        CardPaymentRequest request = new CardPaymentRequest();
        request.setCardNumber("4111111111111111");
        request.setCardExpiry("12/25");
        request.setCardCvc("123");
        request.setAmount(100.0);

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setUserId(2L);
        booking.setTotalAmount(100.0);

        PaymentResponse expectedResponse = new PaymentResponse();
        expectedResponse.setStatus("Success");
        expectedResponse.setTransactionId("CARD-12345678");

        when(bookingService.getBookingById(bookingId)).thenReturn(Optional.of(booking));
        when(paymentService.processCardPayment(any(CardPaymentRequest.class))).thenReturn(expectedResponse);

        // Act
        ResponseEntity<?> response = paymentController.processBookingCardPayment(bookingId, request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
    }
}
