package com.lms.controller;

import com.lms.dto.ActivityDTO;
import com.lms.entity.Book;
import com.lms.entity.IssueRecord;
import com.lms.repository.BookRepository;
import com.lms.repository.IssueRecordRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueRecordRepository issueRecordRepository;

    // 📊 DASHBOARD STATS
    @GetMapping("/stats")
    public Map<String, Object> getStats() {

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalBooks", bookRepository.count());
        stats.put("totalUsers", userRepository.count());

        stats.put("issuedBooks",
                issueRecordRepository.findByStatus(IssueRecord.IssueStatus.ISSUED).size());

        stats.put("returnedBooks",
                issueRecordRepository.findByStatus(IssueRecord.IssueStatus.RETURNED).size());

        stats.put("overdueBooks",
                issueRecordRepository.countByStatusAndDueDateBefore(
                        IssueRecord.IssueStatus.ISSUED,
                        LocalDate.now()
                )
        );

        // ✅ Available stock calculation
        int availableStock = bookRepository.findAll()
                .stream()
                .mapToInt(b -> b.getAvailableStock() == null ? 0 : b.getAvailableStock())
                .sum();

        stats.put("availableStock", availableStock);

        return stats;
    }

    // 📌 ACTIVITY FEED
    @GetMapping("/activity")
    public List<ActivityDTO> getActivity() {

        List<ActivityDTO> activities = new ArrayList<>();

        // 1. BOOK ADDED ACTIVITY
        for (Book book : bookRepository.findAll()) {

            LocalDateTime timestamp = book.getCreatedAt();

            if (timestamp == null) {
                continue; // ❌ no fake date (clean approach)
            }

            activities.add(new ActivityDTO(
                    "ADDED",
                    book.getTitle(),
                    "Admin",
                    timestamp,
                    "Completed"
            ));
        }

        // 2. ISSUE / RETURN ACTIVITY
        for (IssueRecord record : issueRecordRepository.findAll()) {

            if (record.getCreatedAt() != null) {
                activities.add(new ActivityDTO(
                        "ISSUED",
                        record.getBook().getTitle(),
                        record.getUser().getName(),
                        record.getCreatedAt(),
                        "In Progress"
                ));
            }

            if (record.getStatus() == IssueRecord.IssueStatus.RETURNED
                    && record.getReturnedAt() != null) {

                activities.add(new ActivityDTO(
                        "RETURNED",
                        record.getBook().getTitle(),
                        record.getUser().getName(),
                        record.getReturnedAt(),
                        "Completed"
                ));
            }
        }

        // 3. SORT + LIMIT
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(10)
                .collect(Collectors.toList());
    }
}