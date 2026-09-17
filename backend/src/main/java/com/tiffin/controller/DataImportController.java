package com.tiffin.controller;

import com.tiffin.service.DataImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
public class DataImportController {

    private final DataImportService dataImportService;

    public DataImportController(DataImportService dataImportService) {
        this.dataImportService = dataImportService;
    }

    // ── JSON Import ──
    @PostMapping({"/api/customers/import", "/import"})
    public ResponseEntity<Map<String, Object>> importCustomersJson(
            @RequestBody List<Map<String, Object>> records) {
        Map<String, Object> report = dataImportService.importCustomerList(records);
        return ResponseEntity.ok(report);
    }

    // ── CSV File / Multipart Import ──
    @PostMapping({"/api/customers/import-csv", "/import-csv"})
    public ResponseEntity<Map<String, Object>> importCustomersCsv(
            @RequestParam("file") MultipartFile file) throws Exception {
        List<Map<String, Object>> records = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine != null) {
                String[] headers = headerLine.split(",");
                for (int i = 0; i < headers.length; i++) {
                    headers[i] = headers[i].trim().replaceAll("^\"|\"$", "");
                }

                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) continue;
                    String[] values = line.split(",", -1);
                    Map<String, Object> record = new LinkedHashMap<>();
                    for (int i = 0; i < headers.length; i++) {
                        String val = (i < values.length) ? values[i].trim().replaceAll("^\"|\"$", "") : "";
                        record.put(headers[i], val);
                    }
                    records.add(record);
                }
            }
        }

        Map<String, Object> report = dataImportService.importCustomerList(records);
        return ResponseEntity.ok(report);
    }
}
