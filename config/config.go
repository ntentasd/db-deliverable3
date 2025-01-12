package config

import (
	"log"
	"os"
)

type DatabaseConfig struct {
	Host     string
	Port     string
	Name     string
	User     string
	Password string
}

type MemcachedConfig struct {
	Host string
	Port string
}

func LoadDatabaseConfig() DatabaseConfig {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "3306"
	}

	name := os.Getenv("DB_NAME")
	if name == "" {
		name = "datadrive"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "user"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "password"
	}

	log.Printf("Database Config - Host: %s, Port: %s, Name: %s, User: %s, Password: %s",
		host, port, name, user, password,
	)

	return DatabaseConfig{
		Host:     host,
		Port:     port,
		Name:     name,
		User:     user,
		Password: password,
	}
}

func LoadMemcachedConfig() MemcachedConfig {
	host := os.Getenv("MEMCACHED_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("MEMCACHED_PORT")
	if port == "" {
		port = "11211"
	}

	log.Printf("Memcached Config - Host: %s, Port: %s", host, port)

	return MemcachedConfig{
		Host: host,
		Port: port,
	}
}
