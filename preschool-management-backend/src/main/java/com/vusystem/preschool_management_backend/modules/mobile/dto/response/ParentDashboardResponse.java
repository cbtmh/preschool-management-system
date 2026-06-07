package com.vusystem.preschool_management_backend.modules.mobile.dto.response;

import com.vusystem.preschool_management_backend.modules.portal.dto.NewsDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentDashboardResponse {
    private List<ChildSummaryDTO> children;
    private List<NewsDto> recentNews; 
    // Chúng ta sử dụng luôn NewsDto của hệ thống Portal cho tiện, hoặc nếu muốn rút gọn thì tạo NewsSummaryDTO. 
    // Vì NewsDto đã khá gọn nên tận dụng luôn.
}
