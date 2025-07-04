package com.alphaweb.instadrive.config;

import com.alphaweb.instadrive.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ReceiptConfig {

    private final ReceiptService receiptService;

    @Bean
    public CommandLineRunner initReceiptService() {
        return args -> {
            // Initialize the receipts directory
            receiptService.init();
        };
    }
}
