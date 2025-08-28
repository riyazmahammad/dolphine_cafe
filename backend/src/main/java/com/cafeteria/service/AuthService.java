package com.cafeteria.service;

import com.cafeteria.dto.AuthResponse;
import com.cafeteria.dto.LoginRequest;
import com.cafeteria.dto.OtpRequest;
import com.cafeteria.dto.SignupRequest;
import com.cafeteria.model.User;
import com.cafeteria.repository.UserRepository;
import com.cafeteria.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    public String signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(signupRequest.getRole());
        user.setDepartment(signupRequest.getDepartment());
        user.setPhone(signupRequest.getPhone());
        user.setIsActive(false);

        // Generate OTP
        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        // Send OTP email
        emailService.sendOtpEmail(user.getEmail(), otp);

        return "User registered successfully. Please verify your email with the OTP sent.";
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        
        if (!user.getIsActive()) {
            throw new RuntimeException("Account not verified. Please verify your email first.");
        }

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, user, "Login successful");
    }

    public AuthResponse verifyOtp(OtpRequest otpRequest) {
        Optional<User> userOpt = userRepository.findByEmail(otpRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (user.getOtp() == null || !user.getOtp().equals(otpRequest.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        user.setIsActive(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Generate token for auto-login after verification
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            user.getEmail(), null, null
        );
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, user, "Account verified successfully");
    }

    public String resendOtp(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (user.getIsActive()) {
            throw new RuntimeException("Account is already verified");
        }

        // Generate new OTP
        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send OTP email
        emailService.sendOtpEmail(user.getEmail(), otp);

        return "OTP resent successfully";
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}