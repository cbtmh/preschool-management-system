package com.vusystem.preschool_management_backend.modules.auth.repository;

import com.vusystem.preschool_management_backend.common.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRole(com.vusystem.preschool_management_backend.common.entity.enums.Role role);
    
    List<User> findByRoleIn(List<com.vusystem.preschool_management_backend.common.entity.enums.Role> roles);
}