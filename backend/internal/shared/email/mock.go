package email

import (
	"context"
	"log"
)

type MockEmailService struct{}

func NewMockEmailService() *MockEmailService {
	return &MockEmailService{}
}

func (s *MockEmailService) SendVerificationEmail(ctx context.Context, toEmail, token string) error {
	log.Printf("MOCK EMAIL: Sending Verification to %s | Token: %s\n", toEmail, token)
	return nil
}

func (s *MockEmailService) SendPasswordResetEmail(ctx context.Context, toEmail, token string) error {
	log.Printf("MOCK EMAIL: Sending Password Reset to %s | Token: %s\n", toEmail, token)
	return nil
}
