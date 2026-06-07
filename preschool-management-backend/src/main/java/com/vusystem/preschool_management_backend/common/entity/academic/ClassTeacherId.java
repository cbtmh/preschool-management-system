package com.vusystem.preschool_management_backend.common.entity.academic;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@EqualsAndHashCode
public class ClassTeacherId implements Serializable {
    private Long classId;
    private Long teacherId;
}