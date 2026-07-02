package event

import (
	"context"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
)

type KafkaConfig struct {
	Brokers []string
	Topic   string
	GroupID string
}

type KafkaProducer struct {
	writer *kafka.Writer
}

// NewKafkaProducer creates a new Kafka producer
func NewKafkaProducer(cfg KafkaConfig) *KafkaProducer {
	w := &kafka.Writer{
		Addr:                   kafka.TCP(cfg.Brokers...),
		Topic:                  cfg.Topic,
		Balancer:               &kafka.LeastBytes{},
		AllowAutoTopicCreation: true,
	}

	return &KafkaProducer{writer: w}
}

func (p *KafkaProducer) Publish(ctx context.Context, key, value []byte) error {
	err := p.writer.WriteMessages(ctx,
		kafka.Message{
			Key:   key,
			Value: value,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message to kafka: %w", err)
	}
	return nil
}

func (p *KafkaProducer) Close() error {
	return p.writer.Close()
}

type KafkaConsumer struct {
	reader *kafka.Reader
}

// NewKafkaConsumer creates a new Kafka consumer
func NewKafkaConsumer(cfg KafkaConfig) *KafkaConsumer {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  cfg.Brokers,
		GroupID:  cfg.GroupID,
		Topic:    cfg.Topic,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})

	return &KafkaConsumer{reader: r}
}

// Consume starts fetching and handling messages from Kafka
func (c *KafkaConsumer) Consume(ctx context.Context, handler func(ctx context.Context, msg kafka.Message) error) {
	for {
		msg, err := c.reader.FetchMessage(ctx)
		if err != nil {
			log.Printf("failed to fetch message: %v", err)
			break
		}

		if err := handler(ctx, msg); err != nil {
			log.Printf("failed to handle message: %v", err)
			continue
		}

		if err := c.reader.CommitMessages(ctx, msg); err != nil {
			log.Printf("failed to commit message: %v", err)
		}
	}
}

func (c *KafkaConsumer) Close() error {
	return c.reader.Close()
}
