package com.vusystem.preschool_management_backend.modules.portal.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.portal.services.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/news")
@RequiredArgsConstructor
public class NewsPublicController {

    private final NewsService newsService;

    @GetMapping
    public ApiResponse getPublishedNews(Pageable pageable) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách tin tức công khai thành công")
                .data(newsService.getPublishedNews(pageable))
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
}
