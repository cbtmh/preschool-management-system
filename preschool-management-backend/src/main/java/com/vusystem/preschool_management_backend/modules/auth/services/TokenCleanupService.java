package com.vusystem.preschool_management_backend.modules.auth.services;

import com.vusystem.preschool_management_backend.modules.auth.repository.TokenBlacklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupService {

    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final com.vusystem.preschool_management_backend.modules.auth.repository.RefreshTokenRepository refreshTokenRepository;

    // lên lịch dọn dẹp token vào đầu mỗi giờ
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu dọn dẹp các token đã hết hạn...");
        Date now = new Date();
        tokenBlacklistRepository.deleteByExpiryDateBefore(now);
        refreshTokenRepository.deleteByExpiryDateBefore(now);
        log.info("Dọn dẹp token hoàn tất.");
    }
}
