package com.alphaweb.instadrive.repository;

import com.alphaweb.instadrive.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking,Long> {

    /**
     * Find all bookings for a specific car that overlap with the given date range
     *
     * @param carId The ID of the car
     * @param startDate The start date of the period to check
     * @param endDate The end date of the period to check
     * @return List of bookings that overlap with the given date range
     */
    @Query("SELECT b FROM Booking b WHERE b.carId = :carId AND "
           + "((b.startDate <= :endDate) AND (b.endDate >= :startDate))")
    List<Booking> findOverlappingBookings(
            @Param("carId") Long carId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find all bookings for a specific user
     *
     * @param userId The ID of the user
     * @return List of bookings made by the user
     */
    List<Booking> findByUserIdOrderByStartDateDesc(Long userId);

    /**
     * Find all current and future bookings for a specific user
     *
     * @param userId The ID of the user
     * @param currentDate The current date
     * @return List of current and future bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.endDate >= :currentDate ORDER BY b.startDate ASC")
    List<Booking> findCurrentAndFutureBookingsByUserId(
            @Param("userId") Long userId,
            @Param("currentDate") LocalDate currentDate);

    /**
     * Find all past bookings for a specific user
     *
     * @param userId The ID of the user
     * @param currentDate The current date
     * @return List of past bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.endDate < :currentDate ORDER BY b.endDate DESC")
    List<Booking> findPastBookingsByUserId(
            @Param("userId") Long userId,
            @Param("currentDate") LocalDate currentDate);

    /**
     * Find all bookings that have passed their end date but are not yet marked as completed
     *
     * @param currentDate The current date
     * @return List of expired bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.endDate < :currentDate AND b.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Booking> findExpiredBookings(@Param("currentDate") LocalDate currentDate);
}
