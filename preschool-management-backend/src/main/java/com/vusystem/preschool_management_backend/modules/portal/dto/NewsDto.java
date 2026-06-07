package com.vusystem.preschool_management_backend.modules.portal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsDto {
    private Long id;
    private String title;
    private String summary;
    private String content;
    private String category;
    private String imageUrl;
    private Boolean isPublished;
    private LocalDateTime publishedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
