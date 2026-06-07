package com.vusystem.preschool_management_backend.modules.portal.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.portal.dto.NewsRequest;
import com.vusystem.preschool_management_backend.modules.portal.services.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/news")
@RequiredArgsConstructor
public class NewsAdminController {

    private final NewsService newsService;

    @GetMapping
    public ApiResponse getAllNews(Pageable pageable) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách tin tức thành công")
                .data(newsService.getAllNews(pageable))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse getNewsById(@PathVariable Long id) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin tin tức thành công")
                .data(newsService.getNewsById(id))
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse createNews(@ModelAttribute NewsRequest request) {
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo tin tức thành công")
                .data(newsService.createNews(request))
                .build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse updateNews(@PathVariable Long id, @ModelAttribute NewsRequest request) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật tin tức thành công")
                .data(newsService.updateNews(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Xóa tin tức thành công")
                .build();
    }
}
