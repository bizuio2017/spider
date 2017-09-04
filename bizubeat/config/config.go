package config

import (
	"io/ioutil"
	"time"

	"github.com/BurntSushi/toml"
	"github.com/juju/errors"
)

// Config struct
type Config struct {
	Period     time.Duration `toml:"period"`
	NsqAddr    string        `toml:"nsq_addr"`
	NsqTopic   string        `toml:"nsq_topic"`
	NsqChannel string        `toml:"nsq_channel"`
}

// NewConfigWithFile get a new config instance
func NewConfigWithFile(file string) (*Config, error) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, errors.Trace(err)
	}

	return newConfig(string(data))

}

func newConfig(data string) (*Config, error) {
	var c Config

	_, err := toml.Decode(data, &c)
	if err != nil {
		return nil, errors.Trace(err)
	}

	return &c, nil
}
