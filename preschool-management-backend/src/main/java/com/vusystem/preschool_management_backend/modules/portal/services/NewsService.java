package com.vusystem.preschool_management_backend.modules.portal.services;

import com.vusystem.preschool_management_backend.modules.portal.dto.NewsDto;
import com.vusystem.preschool_management_backend.modules.portal.dto.NewsRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NewsService {
    Page<NewsDto> getAllNews(Pageable pageable);
    Page<NewsDto> getPublishedNews(Pageable pageable);
    NewsDto getNewsById(Long id);
    NewsDto createNews(NewsRequest request);
    NewsDto updateNews(Long id, NewsRequest request);
    void deleteNews(Long id);
}
