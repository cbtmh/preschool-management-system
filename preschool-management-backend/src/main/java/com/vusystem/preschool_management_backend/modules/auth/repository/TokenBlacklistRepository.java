package com.vusystem.preschool_management_backend.modules.auth.repository;

import com.vusystem.preschool_management_backend.modules.auth.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {
    boolean existsByToken(String token);
    void deleteByExpiryDateBefore(Date date);
}
