package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.model.Receipt;
import com.alphaweb.instadrive.service.ReceiptService;
import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;
    private final UserService userService;

    /**
     * Get all receipts for the current user
     *
     * @return List of receipts for the current user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Receipt>> getCurrentUserReceipts() {
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        List<Receipt> receipts = receiptService.getReceiptsByUserId(userId);
        return ResponseEntity.ok(receipts);
    }

    /**
     * Get a receipt by ID
     *
     * @param id The receipt ID
     * @return The receipt
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Receipt> getReceiptById(@PathVariable Long id) {
        Optional<Receipt> receiptOptional = receiptService.getReceiptById(id);

        if (receiptOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Receipt receipt = receiptOptional.get();

        // Check if the receipt belongs to the current user or the user is an admin
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        boolean isAdmin = userService.isCurrentUserAdmin();

        if (!receipt.getUserId().equals(userId) && !isAdmin) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        return ResponseEntity.ok(receipt);
    }

    /**
     * Get a receipt by booking ID
     *
     * @param bookingId The booking ID
     * @return The receipt
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Receipt> getReceiptByBookingId(@PathVariable Long bookingId) {
        Optional<Receipt> receiptOptional = receiptService.getReceiptByBookingId(bookingId);

        if (receiptOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Receipt receipt = receiptOptional.get();

        // Check if the receipt belongs to the current user or the user is an admin
        String email = userService.getCurrentUserEmail();
        Long userId = userService.getUserByEmail(email).get().getId();
        boolean isAdmin = userService.isCurrentUserAdmin();

        if (!receipt.getUserId().equals(userId) && !isAdmin) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        return ResponseEntity.ok(receipt);
    }

    /**
     * Download a receipt PDF
     *
     * @param id The receipt ID
     * @return The receipt PDF
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadReceipt(@PathVariable String id) {
        // Validate the ID parameter
        Long receiptId;
        try {
            receiptId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            System.err.println("Invalid receipt ID format: " + id);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid receipt ID format: " + id);
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            System.out.println("Downloading receipt for ID: " + receiptId);

            Optional<Receipt> receiptOptional = receiptService.getReceiptById(receiptId);

            if (receiptOptional.isEmpty()) {
                System.err.println("Receipt not found with ID: " + receiptId);
                return ResponseEntity.notFound().build();
            }

            Receipt receipt = receiptOptional.get();
            System.out.println("Found receipt: " + receipt.getId() + ", path: " + receipt.getReceiptPath());

            // Check if the receipt belongs to the current user or the user is an admin
            String email = userService.getCurrentUserEmail();
            Long userId = userService.getUserByEmail(email).get().getId();
            boolean isAdmin = userService.isCurrentUserAdmin();

            if (!receipt.getUserId().equals(userId) && !isAdmin) {
                System.err.println("User " + userId + " is not authorized to access receipt " + receiptId);
                return ResponseEntity.status(403).build(); // Forbidden
            }

            // Check if receipt path is valid
            if (receipt.getReceiptPath() == null || receipt.getReceiptPath().isEmpty()) {
                System.err.println("Receipt path is null or empty for receipt ID: " + receiptId);

                // Return error response
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Receipt file not found");
                errorResponse.put("receiptId", receiptId);
                return ResponseEntity.status(404).body(errorResponse);
            }

            // Load receipt PDF
            try {
                Resource resource = receiptService.getReceiptPdf(receipt.getReceiptPath());

                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + receipt.getReceiptPath() + "\"")
                        .body(resource);
            } catch (Exception e) {
                System.err.println("Error loading receipt PDF: " + e.getMessage());
                e.printStackTrace();

                // Return error response
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Failed to load receipt file: " + e.getMessage());
                errorResponse.put("receiptId", receiptId);
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.err.println("Unexpected error in downloadReceipt: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
