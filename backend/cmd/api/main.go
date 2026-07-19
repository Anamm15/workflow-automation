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
	userDeliveryHttp "workflow-automation/internal/modules/user/delivery/http"
	userRepo "workflow-automation/internal/modules/user/repository"
	userUse "workflow-automation/internal/modules/user/usecase"
	workspaceDeliveryHttp "workflow-automation/internal/modules/workspace/delivery/http"
	workspaceRepo "workflow-automation/internal/modules/workspace/repository"
	workspaceUse "workflow-automation/internal/modules/workspace/usecase"
	workflowDeliveryHttp "workflow-automation/internal/modules/workflow/delivery/http"
	workflowRepo "workflow-automation/internal/modules/workflow/repository"
	workflowUse "workflow-automation/internal/modules/workflow/usecase"
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
	sessionRepo := authRepo.NewPGSessionRepository(pgPool)
	
	// 5. Initialize User Module
	pgUserRepo := userRepo.NewPGUserRepository(pgPool)
	userUseCase, userFacade := userUse.NewUserUseCase(pgUserRepo)

	// 6. Initialize Auth Module
	authUseCase := authUse.NewAuthUseCase(
		accountRepo,
		userFacade,
		sessionRepo,
		mockEmailSvc,
		jwtSecret,
	)

	// 7. Initialize Workspace Module
	pgWorkspaceRepo := workspaceRepo.NewPGWorkspaceRepository(pgPool)
	workspaceUseCase := workspaceUse.NewWorkspaceUseCase(pgWorkspaceRepo)

	// 8. Initialize Workflow Module
	pgWorkflowRepo := workflowRepo.NewPGWorkflowRepository(pgPool)
	workflowUseCase := workflowUse.NewWorkflowUseCase(pgWorkflowRepo)

	// 8. Setup Gin Router
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

	// API Documentation (Scalar)
	router.Static("/openapi", "./docs/api")
	router.GET("/docs/:module", func(c *gin.Context) {
		module := c.Param("module")
		html := fmt.Sprintf(`<!doctype html>
<html>
  <head>
    <title>%s API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <!-- Setup Scalar -->
    <script id="api-reference" data-url="/openapi/%s.yaml"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`, module, module)
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
	})

	// API Version Group
	apiV1 := router.Group("/api/v1")

	// 9. Register Endpoints
	authDeliveryHttp.NewAuthHandler(apiV1, authUseCase, jwtSecret)
	userDeliveryHttp.NewUserHandler(apiV1, userUseCase, jwtSecret)
	workspaceDeliveryHttp.NewWorkspaceHandler(apiV1, workspaceUseCase, jwtSecret)
	workflowDeliveryHttp.NewWorkflowHandler(apiV1, workflowUseCase, jwtSecret)

	// 10. Start HTTP Server with Graceful Shutdown
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
