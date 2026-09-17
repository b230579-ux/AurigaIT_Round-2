package com.tiffin.controller;

import com.tiffin.dto.PauseRequest;
import com.tiffin.entity.PausePeriod;
import com.tiffin.service.PauseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions/{subId}/pauses")
public class PauseController {

    private final PauseService pauseService;

    public PauseController(PauseService pauseService) {
        this.pauseService = pauseService;
    }

    @PostMapping("/pause")
    public ResponseEntity<PausePeriod> pause(
            @PathVariable Long subId,
            @RequestBody(required = false) PauseRequest request) {
        String reason = (request != null) ? request.getReason() : null;
        PausePeriod pause = pauseService.pauseSubscription(subId, reason);
        return ResponseEntity.status(HttpStatus.CREATED).body(pause);
    }

    @PutMapping("/resume")
    public ResponseEntity<PausePeriod> resume(@PathVariable Long subId) {
        return ResponseEntity.ok(pauseService.resumeSubscription(subId));
    }

    @GetMapping
    public ResponseEntity<List<PausePeriod>> list(@PathVariable Long subId) {
        return ResponseEntity.ok(pauseService.getPausePeriods(subId));
    }
}
