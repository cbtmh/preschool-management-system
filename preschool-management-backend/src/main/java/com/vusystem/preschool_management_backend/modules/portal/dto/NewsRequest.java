package com.vusystem.preschool_management_backend.modules.portal.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsRequest {
    private String title;
    private String summary;
    private String content;
    private String category;
    private Boolean isPublished;
    private MultipartFile image;
}
