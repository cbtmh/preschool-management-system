package com.vusystem.preschool_management_backend.modules.communication.repository;

import com.vusystem.preschool_management_backend.common.entity.communication.NotificationRecipient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {
    Page<NotificationRecipient> findByRecipientIdOrderByNotificationCreatedAtDesc(Long recipientId, Pageable pageable);
    
    long countByRecipientIdAndIsReadFalse(Long recipientId);
    
    List<NotificationRecipient> findByRecipientIdAndIsReadFalse(Long recipientId);

    @Modifying
    @Query("DELETE FROM NotificationRecipient nr WHERE nr.recipient.id = :recipientId")
    void deleteAllByRecipientId(@Param("recipientId") Long recipientId);
}
