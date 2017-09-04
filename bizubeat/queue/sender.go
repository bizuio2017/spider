package nsqproducer

import "github.com/nsqio/go-nsq"

type NsqSender struct {
	W *nsq.Producer
}

var (
	//test
	// addr = "10.8.15.9:4150"

	//product
	addr = "10.8.51.50:4150"
)

// NewNsqSender new
func NewNsqSender() *NsqSender {
	config := nsq.NewConfig()
	w, _ := nsq.NewProducer(addr, config)

	return &NsqSender{
		W: w,
	}
}

// NewNsqSender send
func (n *NsqSender) Sender(body []byte) error {
	err := n.W.Publish("topic_cock", body)
	if err != nil {

	}
	return err
}

func (n *NsqSender) Stop() {
	n.W.Stop()
}
