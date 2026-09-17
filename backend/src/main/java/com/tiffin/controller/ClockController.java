package com.tiffin.controller;

import com.tiffin.entity.OutboxMessage;
import com.tiffin.service.ClockService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
public class ClockController {

    private final ClockService clockService;

    public ClockController(ClockService clockService) {
        this.clockService = clockService;
    }

    // ── POST /clock & /api/clock ──
    @PostMapping({"/clock", "/api/clock"})
    public ResponseEntity<Map<String, Object>> postClock(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date;
        if (targetDate == null && body != null && body.containsKey("date")) {
            try {
                targetDate = LocalDate.parse(body.get("date").toString());
            } catch (Exception ignored) {}
        }
        if (targetDate == null) {
            targetDate = LocalDate.now();
        }

        Map<String, Object> response = clockService.tickClock(targetDate);
        return ResponseEntity.ok(response);
    }

    // ── GET /outbox & /api/outbox ──
    @GetMapping({"/outbox", "/api/outbox"})
    public ResponseEntity<List<OutboxMessage>> getOutbox(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(clockService.getOutboxMessages(date));
    }

    // ── Clear outbox for testing resets ──
    @DeleteMapping({"/outbox", "/api/outbox"})
    public ResponseEntity<Map<String, String>> deleteOutbox() {
        clockService.clearOutbox();
        return ResponseEntity.ok(Map.of("message", "Outbox cleared successfully"));
    }

    @PostMapping({"/outbox/clear", "/api/outbox/clear"})
    public ResponseEntity<Map<String, String>> clearOutboxPost() {
        clockService.clearOutbox();
        return ResponseEntity.ok(Map.of("message", "Outbox cleared successfully"));
    }
}
