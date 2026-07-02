package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	authDeliveryHttp "workflow-automation/internal/modules/auth/delivery/http"
	authRepo "workflow-automation/internal/modules/auth/repository"
	authUse "workflow-automation/internal/modules/auth/usecase"
	"workflow-automation/internal/shared/database"
	"workflow-automation/internal/shared/email"
	"workflow-automation/internal/shared/logger"
	"workflow-automation/internal/shared/middleware"
)

func main() {
	// 1. Load Environment Variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "development"
	}

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	// 2. Initialize Logger
	logger.InitLogger(appEnv)
	logg := logger.Get()
	defer logg.Sync()

	logg.Info("Starting Workflow Automation API...")

	// 3. Initialize Database (Postgres)
	dbConfig := database.PostgresConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSLMODE"),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pgPool, err := database.NewPostgresDB(ctx, dbConfig)
	if err != nil {
		logg.Fatal("Failed to connect to PostgreSQL", zap.Error(err))
	}
	defer pgPool.Close()
	logg.Info("PostgreSQL connection established")

	// 4. Initialize Shared Services
	mockEmailSvc := email.NewMockEmailService()

	// 5. Initialize Auth Module
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		logg.Fatal("JWT_SECRET environment variable is missing")
	}

	accountRepo := authRepo.NewPGAccountRepository(pgPool)
	userRepo := authRepo.NewPGUserRepository(pgPool)
	sessionRepo := authRepo.NewPGSessionRepository(pgPool)

	authUseCase := authUse.NewAuthUseCase(
		accountRepo,
		userRepo,
		sessionRepo,
		mockEmailSvc,
		jwtSecret,
	)

	// 6. Setup Gin Router
	if appEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// Global Middlewares
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "*"
	}
	router.Use(middleware.CORS(allowedOrigins))

	// Health Check Route
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"env":    appEnv,
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// API Version Group
	apiV1 := router.Group("/api/v1")

	// 7. Register Endpoints
	authDeliveryHttp.NewAuthHandler(apiV1, authUseCase, jwtSecret)

	// 8. Start HTTP Server with Graceful Shutdown
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	go func() {
		logg.Info(fmt.Sprintf("Server listening on :%s", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logg.Fatal("Failed to listen and serve", zap.Error(err))
		}
	}()

	// Wait for interrupt signal (SIGINT or SIGTERM)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logg.Info("Graceful shutdown initiated...")

	// 5 seconds timeout for pending requests
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logg.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logg.Info("Server exited successfully")
}
