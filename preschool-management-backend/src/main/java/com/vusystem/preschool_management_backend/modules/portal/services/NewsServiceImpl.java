package com.vusystem.preschool_management_backend.modules.portal.services;

import com.vusystem.preschool_management_backend.common.entity.portal.News;

import com.vusystem.preschool_management_backend.modules.core.services.CloudinaryService;
import com.vusystem.preschool_management_backend.modules.portal.dto.NewsDto;
import com.vusystem.preschool_management_backend.modules.portal.dto.NewsRequest;
import com.vusystem.preschool_management_backend.modules.portal.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public Page<NewsDto> getAllNews(Pageable pageable) {
        return newsRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDto);
    }

    @Override
    public Page<NewsDto> getPublishedNews(Pageable pageable) {
        return newsRepository.findByIsPublishedTrueOrderByPublishedDateDesc(pageable).map(this::mapToDto);
    }

    @Override
    public NewsDto getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tin tức không tồn tại với id: " + id));
        return mapToDto(news);
    }

    @Override
    public NewsDto createNews(NewsRequest request) {
        String imageUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(request.getImage());
        }

        News news = News.builder()
                .title(request.getTitle())
                .summary(request.getSummary())
                .content(request.getContent())
                .category(request.getCategory())
                .imageUrl(imageUrl)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : true)
                .build();

        return mapToDto(newsRepository.save(news));
    }

    @Override
    public NewsDto updateNews(Long id, NewsRequest request) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tin tức không tồn tại với id: " + id));

        news.setTitle(request.getTitle());
        news.setSummary(request.getSummary());
        news.setContent(request.getContent());
        news.setCategory(request.getCategory());
        
        if (request.getIsPublished() != null) {
            news.setIsPublished(request.getIsPublished());
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(request.getImage());
            news.setImageUrl(imageUrl);
        }

        return mapToDto(newsRepository.save(news));
    }

    @Override
    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tin tức không tồn tại với id: " + id));
        newsRepository.delete(news);
    }

    private NewsDto mapToDto(News news) {
        return NewsDto.builder()
                .id(news.getId())
                .title(news.getTitle())
                .summary(news.getSummary())
                .content(news.getContent())
                .category(news.getCategory())
                .imageUrl(news.getImageUrl())
                .isPublished(news.getIsPublished())
                .publishedDate(news.getPublishedDate())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .build();
    }
}
