package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.model.Booking;
import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.model.Receipt;
import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.repository.ReceiptRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final UserService userService;
    private final CarService carService;

    @Value("${file.receipts-dir:receipts}")
    private String receiptsDir;

    /**
     * Initialize the receipts directory
     */
    public void init() {
        try {
            Path receiptsPath = Paths.get(receiptsDir).toAbsolutePath().normalize();
            Files.createDirectories(receiptsPath);
            System.out.println("Receipts directory created at: " + receiptsPath);
        } catch (IOException e) {
            System.err.println("Error creating receipts directory: " + e.getMessage());
            throw new RuntimeException("Could not create receipts directory", e);
        }
    }

    /**
     * Generate a receipt for a booking
     *
     * @param booking The booking to generate a receipt for
     * @param transactionId The transaction ID
     * @param paymentMethod The payment method
     * @return The generated receipt
     */
    public Receipt generateReceipt(Booking booking, String transactionId, String paymentMethod) {
        // Get user and car details
        Optional<User> userOptional = userService.getUserById(booking.getUserId());
        Optional<Car> carOptional = carService.getCarById(booking.getCarId());

        if (userOptional.isEmpty()) {
            System.err.println("User not found with ID: " + booking.getUserId());
            throw new RuntimeException("User not found with ID: " + booking.getUserId());
        }

        if (carOptional.isEmpty()) {
            System.err.println("Car not found with ID: " + booking.getCarId());
            throw new RuntimeException("Car not found with ID: " + booking.getCarId());
        }

        User user = userOptional.get();
        Car car = carOptional.get();

        // Create receipt
        Receipt receipt = new Receipt();
        receipt.setBookingId(booking.getId());
        receipt.setUserId(booking.getUserId());
        receipt.setCarId(booking.getCarId());
        receipt.setTransactionId(transactionId);
        receipt.setTransactionDate(LocalDateTime.now());
        receipt.setAmount(booking.getTotalAmount());
        receipt.setPaymentMethod(paymentMethod);

        // Set additional information
        receipt.setUserName(user.getName());
        receipt.setUserEmail(user.getEmail());
        receipt.setCarBrand(car.getBrand());
        receipt.setCarModel(car.getModel());
        receipt.setCarRegistrationNumber(car.getRegistrationNumber());

        // Generate PDF receipt
        String receiptPath = generatePdfReceipt(receipt, booking, user, car);
        receipt.setReceiptPath(receiptPath);

        // Save receipt to database
        return receiptRepository.save(receipt);
    }

    /**
     * Generate a PDF receipt
     *
     * @param receipt The receipt information
     * @param booking The booking information
     * @param user The user information
     * @param car The car information
     * @return The path to the generated PDF
     */
    private String generatePdfReceipt(Receipt receipt, Booking booking, User user, Car car) {
        // Create a unique filename
        String fileName = "receipt_" + receipt.getTransactionId() + ".pdf";
        Path filePath = Paths.get(receiptsDir).resolve(fileName).normalize();

        try {
            // Create PDF document
            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(filePath.toFile()));
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
            Paragraph title = new Paragraph("InstaDrive - Booking Receipt", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Add receipt details
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);

            // Transaction details
            document.add(new Paragraph("Transaction Details", boldFont));
            document.add(Chunk.NEWLINE);

            PdfPTable transactionTable = new PdfPTable(2);
            transactionTable.setWidthPercentage(100);

            addTableRow(transactionTable, "Transaction ID:", receipt.getTransactionId(), normalFont);
            addTableRow(transactionTable, "Transaction Date:",
                    receipt.getTransactionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), normalFont);
            addTableRow(transactionTable, "Payment Method:", receipt.getPaymentMethod(), normalFont);

            document.add(transactionTable);
            document.add(Chunk.NEWLINE);

            // Customer details
            document.add(new Paragraph("Customer Details", boldFont));
            document.add(Chunk.NEWLINE);

            PdfPTable customerTable = new PdfPTable(2);
            customerTable.setWidthPercentage(100);

            addTableRow(customerTable, "Name:", user.getName(), normalFont);
            addTableRow(customerTable, "Email:", user.getEmail(), normalFont);
            addTableRow(customerTable, "Phone:", user.getPhone(), normalFont);
            addTableRow(customerTable, "Address:", user.getAddress(), normalFont);

            document.add(customerTable);
            document.add(Chunk.NEWLINE);

            // Car details
            document.add(new Paragraph("Car Details", boldFont));
            document.add(Chunk.NEWLINE);

            PdfPTable carTable = new PdfPTable(2);
            carTable.setWidthPercentage(100);

            addTableRow(carTable, "Brand:", car.getBrand(), normalFont);
            addTableRow(carTable, "Model:", car.getModel(), normalFont);
            addTableRow(carTable, "Registration Number:", car.getRegistrationNumber(), normalFont);
            addTableRow(carTable, "Fuel Type:", car.getFuelType(), normalFont);
            addTableRow(carTable, "Transmission:", car.getTransmission(), normalFont);

            document.add(carTable);
            document.add(Chunk.NEWLINE);

            // Booking details
            document.add(new Paragraph("Booking Details", boldFont));
            document.add(Chunk.NEWLINE);

            PdfPTable bookingTable = new PdfPTable(2);
            bookingTable.setWidthPercentage(100);

            addTableRow(bookingTable, "Booking ID:", booking.getId().toString(), normalFont);
            addTableRow(bookingTable, "Start Date:", booking.getStartDate().toString(), normalFont);
            addTableRow(bookingTable, "End Date:", booking.getEndDate().toString(), normalFont);
            addTableRow(bookingTable, "Total Amount:", "$" + String.format("%.2f", booking.getTotalAmount()), normalFont);

            document.add(bookingTable);
            document.add(Chunk.NEWLINE);

            // Add car image if available
            if (car.getImageUrl() != null && !car.getImageUrl().isEmpty()) {
                try {
                    // Skip image for now as it might cause issues with remote URLs
                    // In a production environment, you would download the image first and then include it
                    document.add(new Paragraph("Car Image URL: " + car.getImageUrl(), normalFont));
                    document.add(Chunk.NEWLINE);
                } catch (Exception e) {
                    // Log error but continue without the image
                    System.err.println("Error adding car image to receipt: " + e.getMessage());
                }
            }

            // Add footer
            document.add(new Paragraph("Thank you for choosing InstaDrive!", boldFont));

            document.close();

            return fileName;
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Error generating PDF receipt", e);
        }
    }

    /**
     * Add a row to a PDF table
     *
     * @param table The table to add the row to
     * @param label The label for the row
     * @param value The value for the row
     * @param font The font to use
     */
    private void addTableRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(valueCell);
    }

    /**
     * Get a receipt by ID
     *
     * @param id The receipt ID
     * @return The receipt
     */
    public Optional<Receipt> getReceiptById(Long id) {
        return receiptRepository.findById(id);
    }

    /**
     * Get a receipt by booking ID
     *
     * @param bookingId The booking ID
     * @return The receipt
     */
    public Optional<Receipt> getReceiptByBookingId(Long bookingId) {
        return receiptRepository.findByBookingId(bookingId);
    }

    /**
     * Get a receipt by transaction ID
     *
     * @param transactionId The transaction ID
     * @return The receipt
     */
    public Optional<Receipt> getReceiptByTransactionId(String transactionId) {
        return receiptRepository.findByTransactionId(transactionId);
    }

    /**
     * Get all receipts for a user
     *
     * @param userId The user ID
     * @return The list of receipts
     */
    public List<Receipt> getReceiptsByUserId(Long userId) {
        return receiptRepository.findByUserId(userId);
    }

    /**
     * Get a receipt PDF as a resource
     *
     * @param fileName The receipt file name
     * @return The receipt PDF resource
     */
    public Resource getReceiptPdf(String fileName) {
        try {
            // Log the receipt directory and file path for debugging
            Path receiptsPath = Paths.get(receiptsDir).toAbsolutePath().normalize();
            Path filePath = receiptsPath.resolve(fileName).normalize();

            System.out.println("Looking for receipt at: " + filePath);

            // Check if the directory exists
            if (!Files.exists(receiptsPath)) {
                System.err.println("Receipts directory does not exist: " + receiptsPath);
                // Try to create the directory
                try {
                    Files.createDirectories(receiptsPath);
                    System.out.println("Created receipts directory: " + receiptsPath);
                } catch (IOException ioe) {
                    System.err.println("Failed to create receipts directory: " + ioe.getMessage());
                }
                throw new RuntimeException("Receipts directory does not exist: " + receiptsPath);
            }

            // Check if the file exists
            if (!Files.exists(filePath)) {
                System.err.println("Receipt file does not exist: " + filePath);
                // List files in the directory for debugging
                try {
                    System.out.println("Files in receipts directory:");
                    Files.list(receiptsPath).forEach(path -> System.out.println("  " + path));
                } catch (IOException ioe) {
                    System.err.println("Failed to list files in receipts directory: " + ioe.getMessage());
                }
                throw new RuntimeException("Receipt file does not exist: " + filePath);
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                System.err.println("Resource does not exist despite file existing: " + filePath);
                throw new RuntimeException("Receipt not found: " + fileName);
            }
        } catch (MalformedURLException e) {
            System.err.println("MalformedURLException: " + e.getMessage());
            throw new RuntimeException("Error retrieving receipt: " + fileName, e);
        }
    }
}
