package com.vusystem.preschool_management_backend.modules.auth.services.impl;

import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .map(user -> org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPasswordHash())
                    .authorities("ROLE_" + user.getRole().name())
                    .disabled(!user.getIsActive())
                    .build())
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với SĐT: " + username));
    }
}


