package com.vusystem.preschool_management_backend.modules.auth.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ParentDto {
    private Long parentId;
    private String fullName;
    private String address;
    private List<ChildDto> children;
}