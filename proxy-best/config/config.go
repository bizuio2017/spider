package config

import (
	"io/ioutil"

	"github.com/BurntSushi/toml"
	"github.com/juju/errors"
)

// type SourceConfig struct {
// 	Schema string   `toml:"schema"`
// 	Tables []string `toml:"tables"`
// }

type Config struct {
	DaxiangApi  string `toml:"daxiang_api"`
	TesthttpApi string `toml:"testhttp_api"`
	Timeout     int64  `toml:"timeout"`

	// EsIndexs []string `toml:"es_indexs"`
}

func NewConfigWithFile(name string) (*Config, error) {
	data, err := ioutil.ReadFile(name)
	if err != nil {
		return nil, errors.Trace(err)
	}

	return NewConfig(string(data))
}

//NewConfig
func NewConfig(file string) (*Config, error) {
	var c Config

	_, err := toml.Decode(file, &c)
	if err != nil {
		return nil, errors.Trace(err)
	}

	return &c, nil
}
