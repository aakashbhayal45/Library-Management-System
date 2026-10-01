package com.lms.service;

import com.lms.entity.Book;
import com.lms.entity.IssueRecord;
import com.lms.entity.User;
import com.lms.exception.*;
import com.lms.repository.BookRepository;
import com.lms.repository.IssueRecordRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class IssueService {

    @Autowired
    private IssueRecordRepository issueRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔥 ISSUE BOOK
    public IssueRecord issueBook(Long bookId, Long userId, Integer durationDays) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new BookNotFoundException("Book not found with id: " + bookId));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + userId));

        if (book.getAvailableStock() <= 0) {
            throw new BookOutOfStockException("Book not available in stock");
        }

        book.setAvailableStock(book.getAvailableStock() - 1);
        bookRepository.save(book);

        IssueRecord record = new IssueRecord();
        record.setBook(book);
        record.setUser(user);
        record.setIssueDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(durationDays));
        record.setStatus(IssueRecord.IssueStatus.ISSUED);

        return issueRecordRepository.save(record);
    }

    // 🔥 RETURN BOOK
    public IssueRecord returnBook(Long bookId, Long userId) {

        IssueRecord record = issueRecordRepository
                .findByBookIdAndUserIdAndStatus(
                        bookId,
                        userId,
                        IssueRecord.IssueStatus.ISSUED)
                .orElseThrow(() ->
                        new IssueRecordNotFoundException(
                                "No active issue record found for this book and user"));

        Book book = record.getBook();

        book.setAvailableStock(book.getAvailableStock() + 1);
        bookRepository.save(book);

        record.setReturnDate(LocalDate.now());
        record.setReturnedAt(LocalDateTime.now());
        record.setStatus(IssueRecord.IssueStatus.RETURNED);

        long lateDays = ChronoUnit.DAYS.between(record.getDueDate(), record.getReturnDate());

        if (lateDays > 0) {
            record.setFine(lateDays * 1.0);
        }

        return issueRecordRepository.save(record);
    }

    // 🔥 PAY FINE
    public IssueRecord payFine(Long id) {

        IssueRecord record = issueRecordRepository.findById(id)
                .orElseThrow(() ->
                        new IssueRecordNotFoundException("Issue record not found with id: " + id));

        record.setFinePaid(true);
        return issueRecordRepository.save(record);
    }

    public List<IssueRecord> getAllRecords() {
        return issueRecordRepository.findAll();
    }
}