package com.vusystem.preschool_management_backend.common.entity.academic;

import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "class_teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassTeacher implements Serializable {

    @EmbeddedId
    private ClassTeacherId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classId")
    @JoinColumn(name = "class_id")
    @ToString.Exclude
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teacherId")
    @JoinColumn(name = "teacher_id")
    @ToString.Exclude
    private Teacher teacher;

}

