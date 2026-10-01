package com.lms.service;

import com.lms.entity.Book;
import com.lms.exception.BookNotFoundException;
import com.lms.exception.DuplicateResourceException;
import com.lms.repository.BookRepository;
import com.lms.repository.IssueRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private IssueRecordRepository issueRecordRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.searchBooks(keyword);
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() ->
                        new BookNotFoundException("Book not found with id: " + id));
    }

    public Book addUpdateBook(Book book) {

        // ADD BOOK
        if (book.getId() == null) {

            if (bookRepository.existsByTitleAndAuthor(book.getTitle(), book.getAuthor())) {
                throw new DuplicateResourceException("Book already exists");
            }

            book.setAvailableStock(book.getQuantity());
        }

        // UPDATE BOOK
        else {

            Book existing = bookRepository.findById(book.getId())
                    .orElseThrow(() ->
                            new BookNotFoundException("Book not found with id: " + book.getId()));

            book.setCreatedAt(existing.getCreatedAt());

            int delta = book.getQuantity() - existing.getQuantity();
            book.setAvailableStock(existing.getAvailableStock() + delta);
        }

        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() ->
                        new BookNotFoundException("Book not found with id: " + id));

        issueRecordRepository.deleteByBookId(id);
        bookRepository.delete(book);
    }
}