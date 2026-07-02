package logger

import (
	"context"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var globalLogger *zap.Logger

// InitLogger initializes the global structured logger
func InitLogger(env string) {
	var config zap.Config
	if env == "production" {
		config = zap.NewProductionConfig()
	} else {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}

	logger, err := config.Build()
	if err != nil {
		os.Exit(1)
	}
	globalLogger = logger
}

// Get returns the base global logger instance
func Get() *zap.Logger {
	if globalLogger == nil {
		InitLogger("development")
	}
	return globalLogger
}

// WithContext returns a logger enriched with module, usecase, and context values (e.g., RequestID)
func WithContext(ctx context.Context, module, usecase string) *zap.Logger {
	// Expected context extraction for Trace ID / Request ID here
	// reqID, _ := ctx.Value("requestID").(string)
	
	log := Get().With(
		zap.String("module", module),
		zap.String("usecase", usecase),
	)
	
	// if reqID != "" {
	// 	log = log.With(zap.String("request_id", reqID))
	// }
	
	return log
}
