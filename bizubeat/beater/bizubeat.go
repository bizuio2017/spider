package beater

import (
	"github.com/bizuio2017/spider/beats/libbeat/common"
	"github.com/bizuio2017/spider/beats/libbeat/beat"
	"github.com/bizuio2017/spider/beats/libbeat/publisher"
	"github.com/bizuio2017/spider/config"
)

type BizuBeat struct {
	done   chan struct{}
	config config.Config
	client publisher.Client
}

type ProductData struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	SrcLink     string `json:"srclink"`
	ImgLink     string `json:"imglink"`
}

func New(b *beat.Beat, cfg *common.Config) (beat.Beater, error) {

	config := config.DefaultConfig

	bt := &BizuBeat{
		done:   make(chan struct{}),
		config: config,
	}
	return bt, nil
}

func(bt *BizuBeat) Run(b *beat.Beat) error {
  fmt.Println("bizubeat is running! Hit CTRL -C to stop it.")

  bt.client = b.Publisher.Connect()

  ticker := time.NewTicker(bt.config.Period)

  for {
    select {
    case <- bt.done:
      fmt.Println("All done finish...")
      return nil
    case <-ticker.C:
    }

    // Doing once

    now := time.Now()
    productData, err := bt.getYunbiData(bt.config.ASIN)

    event := common.MapStr{
      "@timestamp": common.Time(now)
    }

    // Send crawler data to nsq queue
    bt.Client.PublishEvent(event)
    logp.Info(Event sent)
  }
}

func (bt *BizuBeat)
