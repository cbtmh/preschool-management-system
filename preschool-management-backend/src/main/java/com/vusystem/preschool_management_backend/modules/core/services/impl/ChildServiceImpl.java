package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.common.entity.user.Parent;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ChildRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AllergyRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AllergyResponse;
import com.vusystem.preschool_management_backend.common.entity.health.Allergy;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ParentRepository;
import com.vusystem.preschool_management_backend.modules.core.services.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vusystem.preschool_management_backend.common.entity.enums.Gender;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import com.vusystem.preschool_management_backend.common.entity.enums.StudentStatus;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.services.UserService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChildServiceImpl implements ChildService {

    private final ChildRepository childRepository;
    private final ParentRepository parentRepository; // Bắt buộc phải có để map khóa ngoại
    private final UserService userService;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public ChildResponse createChild(ChildRequest request) {
        // 1. Kiểm tra xem Parent ID mà Frontend gửi lên có tồn tại trong DB không
        Parent parent = parentRepository.findById(request.getParentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Phụ huynh với ID: " + request.getParentId()));

        // 2. Build Entity Child và móc nối vào Parent
        Child newChild = Child.builder()
                .fullName(request.getFullName())
                .dob(request.getDob())
                .gender(request.getGender())
                .status(request.getStatus())
                .healthNotes(request.getHealthNotes())
                .parent(parent) // Móc khóa ngoại ở đây
                .allergyDeclared(request.getAllergyDeclared() != null ? request.getAllergyDeclared() : false)
                .build();
                
        if (request.getAllergies() != null) {
            List<Allergy> allergies = request.getAllergies().stream().map(dto -> 
                Allergy.builder()
                        .child(newChild)
                        .allergen(dto.getAllergen())
                        .severity(dto.getSeverity())
                        .description(dto.getDescription())
                        .build()
            ).collect(Collectors.toList());
            newChild.setAllergies(allergies);
        }

        Child savedChild = childRepository.save(newChild);
        return mapToResponse(savedChild);
    }

    @Override
    @Transactional
    public ChildResponse updateChild(Long id, ChildRequest request) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + id));

        // Nếu có thay đổi người giám hộ (ParentId bị đổi), phải check lại Parent mới
        if (!child.getParent().getId().equals(request.getParentId())) {
            Parent newParent = parentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Phụ huynh với ID: " + request.getParentId()));
            child.setParent(newParent);
        }

        // Cập nhật các thông tin khác
        child.setFullName(request.getFullName());
        child.setDob(request.getDob());
        child.setGender(request.getGender());
        child.setStatus(request.getStatus());
        child.setHealthNotes(request.getHealthNotes());
        child.setAllergyDeclared(request.getAllergyDeclared() != null ? request.getAllergyDeclared() : false);
        
        child.getAllergies().clear();
        if (request.getAllergies() != null) {
            List<Allergy> newAllergies = request.getAllergies().stream().map(dto -> 
                Allergy.builder()
                        .child(child)
                        .allergen(dto.getAllergen())
                        .severity(dto.getSeverity())
                        .description(dto.getDescription())
                        .build()
            ).collect(Collectors.toList());
            child.getAllergies().addAll(newAllergies);
        }

        Child updatedChild = childRepository.save(child);
        return mapToResponse(updatedChild);
    }

    @Override
    public ChildResponse getChildById(Long id) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + id));
        java.util.Set<Long> enrolledIds = enrollmentRepository.findChildIdsEnrolledInCurrentYear();
        return mapToResponse(child, enrolledIds.contains(id));
    }

    @Override
    public List<ChildResponse> getChildrenByParentId(Long parentId) {
        // Kiểm tra xem Parent có tồn tại không trước khi lấy list Child
        if (!parentRepository.existsById(parentId)) {
            throw new RuntimeException("Không tìm thấy hồ sơ Phụ huynh với ID: " + parentId);
        }
        
        List<Child> children = childRepository.findByParentId(parentId);
        java.util.Set<Long> enrolledIds = enrollmentRepository.findChildIdsEnrolledInCurrentYear();
        
        return children.stream()
                .map(child -> mapToResponse(child, enrolledIds.contains(child.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<ChildResponse> getAllChildren() {
        List<Child> children = childRepository.findAll();
        java.util.Set<Long> enrolledIds = enrollmentRepository.findChildIdsEnrolledInCurrentYear();
        
        return children.stream()
                .map(child -> mapToResponse(child, enrolledIds.contains(child.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteChild(Long id) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + id));
        
        // Khác với Teacher hay Parent (phải soft-delete User), 
        // Child không có User nên ta có thể xóa trực tiếp hồ sơ khỏi DB.
        // Hoặc nếu muốn lưu lại lịch sử, em có thể đổi Status thay vì xóa cứng. 
        // Ở đây anh dùng xóa cứng (Hard Delete) theo chuẩn quan hệ DB.
        childRepository.delete(child);
    }

    // --- Helper Method: Chuyển đổi từ Entity sang Response DTO ---
    private ChildResponse mapToResponse(Child entity, boolean hasCurrentEnrollment) {
        return ChildResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .dob(entity.getDob())
                .gender(entity.getGender())
                .status(entity.getStatus())
                .healthNotes(entity.getHealthNotes())
                .parentId(entity.getParent().getId())
                .parentName(entity.getParent().getFullName()) // Lấy tên phụ huynh để FE hiển thị cho đẹp
                .parentPhone(entity.getParent().getUser().getUsername()) // Số điện thoại là username
                .hasCurrentEnrollment(hasCurrentEnrollment)
                .allergyDeclared(entity.getAllergyDeclared())
                .allergies(entity.getAllergies() != null ? entity.getAllergies().stream().map(a -> 
                    AllergyResponse.builder()
                            .id(a.getId())
                            .allergen(a.getAllergen())
                            .severity(a.getSeverity())
                            .description(a.getDescription())
                            .build()
                ).collect(Collectors.toList()) : java.util.Collections.emptyList())
                .build();
    }
    
    // Overloaded method cho create/update nơi học sinh mới chắc chắn chưa có lớp
    private ChildResponse mapToResponse(Child entity) {
        return mapToResponse(entity, false);
    }
    
    @Override
    @Transactional
    public ChildResponse updateChildAllergies(Long childId, List<AllergyRequest> allergyRequests) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + childId));
                
        child.setAllergyDeclared(true);
        child.getAllergies().clear();
        
        if (allergyRequests != null && !allergyRequests.isEmpty()) {
            List<Allergy> newAllergies = allergyRequests.stream().map(dto -> 
                Allergy.builder()
                        .child(child)
                        .allergen(dto.getAllergen())
                        .severity(dto.getSeverity())
                        .description(dto.getDescription())
                        .build()
            ).collect(Collectors.toList());
            child.getAllergies().addAll(newAllergies);
        }
        
        Child updatedChild = childRepository.save(child);
        java.util.Set<Long> enrolledIds = enrollmentRepository.findChildIdsEnrolledInCurrentYear();
        return mapToResponse(updatedChild, enrolledIds.contains(childId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void importChildrenAndParents(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Tệp tải lên không được để trống");
        }

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new RuntimeException("Không tìm thấy dữ liệu trong tệp Excel");
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    // Extract columns
                    String childName = getCellValueAsString(row.getCell(0));
                    String dobString = getCellValueAsString(row.getCell(1));
                    String genderString = getCellValueAsString(row.getCell(2));
                    String parentName = getCellValueAsString(row.getCell(3));
                    String parentPhone = getCellValueAsString(row.getCell(4));
                    String parentAddress = getCellValueAsString(row.getCell(5));

                    if (childName.isEmpty() || parentPhone.isEmpty()) {
                        continue; // Skip invalid rows
                    }

                    // Parse Date and Gender
                    LocalDate dob = LocalDate.parse(dobString);
                    Gender gender = Gender.valueOf(genderString.toUpperCase());

                    // Check and Create User/Parent
                    Parent parent = parentRepository.findByUserUsername(parentPhone).orElseGet(() -> {
                        // User DOES NOT exist
                        User newUser;
                        if (!userService.existsByUsername(parentPhone)) {
                            newUser = userService.createNewUser(parentPhone, Role.PARENT);
                        } else {
                            newUser = userService.findByUsername(parentPhone).get();
                        }
                        
                        Parent newParent = Parent.builder()
                                .user(newUser)
                                .fullName(parentName)
                                .address(parentAddress)
                                .build();
                        return parentRepository.save(newParent);
                    });

                    // Create Child
                    if (childRepository.existsByFullNameAndDobAndParentId(childName, dob, parent.getId())) {
                        continue; // Skip because this child already exists for this parent
                    }

                    Child newChild = Child.builder()
                            .fullName(childName)
                            .dob(dob)
                            .gender(gender)
                            .status(StudentStatus.STUDYING)
                            .parent(parent)
                            .build();

                    childRepository.save(newChild);

                } catch (Exception ex) {
                    throw new RuntimeException("Lỗi tại dòng " + (i + 1) + ": " + ex.getMessage(), ex);
                }
            }
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage(), e);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                long num = (long) cell.getNumericCellValue();
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}