package main

import (
	"os"

	"github.com/bizuio2017/beats/libbeat/beat"
	"github.com/stanxii/filebeat/beater"
)

func main() {
	err := beat.Run("BizuBeat", "", beater.New)
	if err != nil {
		os.Exit(1)
	}
}
