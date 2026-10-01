package com.lms.controller;

import com.lms.entity.IssueRecord;
import com.lms.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping("/issue")
    public IssueRecord issueBook(@RequestBody Map<String, Object> payload) {

        Long bookId = Long.valueOf(payload.get("bookId").toString());
        Long userId = Long.valueOf(payload.get("userId").toString());
        Integer duration = Integer.valueOf(payload.get("duration").toString());

        return issueService.issueBook(bookId, userId, duration);
    }

    @PostMapping("/return")
    public IssueRecord returnBook(@RequestBody Map<String, Object> payload) {

        Long bookId = Long.valueOf(payload.get("bookId").toString());
        Long userId = Long.valueOf(payload.get("userId").toString());

        return issueService.returnBook(bookId, userId);
    }

    @PostMapping("/{id}/pay-fine")
    public IssueRecord payFine(@PathVariable Long id) {
        return issueService.payFine(id);
    }

    @GetMapping
    public List<IssueRecord> getAll() {
        return issueService.getAllRecords();
    }
}