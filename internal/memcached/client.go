package memcached

import (
	"fmt"
	"time"

	"github.com/bradfitz/gomemcache/memcache"
)

type Client struct {
	client *memcache.Client
}

func NewClient(host, port string) *Client {
	server := fmt.Sprintf("%s:%s", host, port)
	mc := memcache.New(server)
	mc.Timeout = 2 * time.Second
	return &Client{client: mc}
}

func (c *Client) Set(key string, value []byte, ttl int32) error {
	return c.client.Set(&memcache.Item{
		Key:        key,
		Value:      value,
		Expiration: ttl,
	})
}

func (c *Client) Get(key string) ([]byte, error) {
	item, err := c.client.Get(key)
	if err != nil {
		return nil, err
	}
	return item.Value, nil
}

func (c *Client) Delete(key string) error {
	return c.client.Delete(key)
}
