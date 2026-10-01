package com.lms.repository;

import com.lms.entity.IssueRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IssueRecordRepository extends JpaRepository<IssueRecord, Long> {
    List<IssueRecord> findByStatus(IssueRecord.IssueStatus status);
    Optional<IssueRecord> findByBookIdAndUserIdAndStatus(Long bookId, Long userId, IssueRecord.IssueStatus status);
    long countByStatusAndDueDateBefore(IssueRecord.IssueStatus status, LocalDate date);
    List<IssueRecord> findByStatusAndDueDateBefore(IssueRecord.IssueStatus status, LocalDate date);
    
    void deleteByBookId(Long bookId);
    void deleteByUserId(Long userId);
}
