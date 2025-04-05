package com.hbhw.jippy.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Transactional
    public void sendTempPassword(String name, String email, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setFrom(senderEmail);
        message.setSubject("[Jippy] 임시 비밀번호 발급");
        message.setText(String.format("""
                안녕하세요. %s님! 임시 비밀번호가 발급되었습니다.
                
                임시 비밀번호: %s
                
                보안을 위해 로그인 후 반드시 비밀번호를 변경해 주세요.
                """, name, tempPassword));

        mailSender.send(message);
    }
}
