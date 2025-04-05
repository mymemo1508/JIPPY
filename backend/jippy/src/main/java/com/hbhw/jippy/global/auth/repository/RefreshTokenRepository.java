package com.hbhw.jippy.global.auth.repository;

import com.hbhw.jippy.global.auth.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
}
