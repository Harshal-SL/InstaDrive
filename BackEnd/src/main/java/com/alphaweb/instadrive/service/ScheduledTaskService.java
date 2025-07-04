package com.alphaweb.instadrive.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service for handling scheduled tasks
 */
@Service
@RequiredArgsConstructor
public class ScheduledTaskService {

    private final BookingService bookingService;

    /**
     * Check and update expired bookings every hour
     * This runs at the top of every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void updateExpiredBookings() {
        try {
            int updatedCount = bookingService.updateExpiredBookings();
            System.out.println("Scheduled task: Updated " + updatedCount + " expired bookings");
        } catch (Exception e) {
            System.err.println("Error in scheduled task for updating expired bookings: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Check and update expired bookings every day at midnight
     * This is a backup to ensure all expired bookings are caught
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void dailyExpiredBookingsCheck() {
        try {
            int updatedCount = bookingService.updateExpiredBookings();
            System.out.println("Daily scheduled task: Updated " + updatedCount + " expired bookings");
        } catch (Exception e) {
            System.err.println("Error in daily scheduled task for updating expired bookings: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
