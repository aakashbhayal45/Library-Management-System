package com.lms.controller;

import com.lms.entity.Book;
import com.lms.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public List<Book> getAll(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            return bookService.searchBooks(keyword);
        }
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public Book getById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @PostMapping
    public Book addUpdate(@RequestBody Book book) {//add book
        return bookService.addUpdateBook(book);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        bookService.deleteBook(id);
        return "Book deleted successfully";
    }
}