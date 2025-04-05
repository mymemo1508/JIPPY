package com.hbhw.jippy.utils;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UUIDProvider {

    public String generateUUID(){
        return UUID.randomUUID().toString();
    }
}
