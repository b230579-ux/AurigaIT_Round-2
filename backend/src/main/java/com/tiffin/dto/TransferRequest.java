package com.tiffin.dto;

import java.time.LocalDate;

public class TransferRequest {

    private String targetPhone;
    private Long targetCustomerId;
    private LocalDate transferDate;
    private String reason;

    public TransferRequest() {}

    public TransferRequest(String targetPhone, Long targetCustomerId, LocalDate transferDate, String reason) {
        this.targetPhone = targetPhone;
        this.targetCustomerId = targetCustomerId;
        this.transferDate = transferDate;
        this.reason = reason;
    }

    public String getTargetPhone() { return targetPhone; }
    public void setTargetPhone(String targetPhone) { this.targetPhone = targetPhone; }

    public Long getTargetCustomerId() { return targetCustomerId; }
    public void setTargetCustomerId(Long targetCustomerId) { this.targetCustomerId = targetCustomerId; }

    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
