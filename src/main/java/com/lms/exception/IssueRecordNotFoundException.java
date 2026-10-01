package com.lms.exception;

public class IssueRecordNotFoundException extends RuntimeException {
    public IssueRecordNotFoundException(String message) {
        super(message);
    }
}