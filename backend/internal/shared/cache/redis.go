package cache

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// NewRedisClient initializes a new Redis client connection
func NewRedisClient(ctx context.Context, cfg RedisConfig) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	log.Println("Successfully connected to Redis")
	return rdb, nil
}
