package nsqproducer

import "testing"

func TestSender(t *testing.T) {

	n := NewNsqSender()
	msg := "hello"

	for i := 0; i < 5; i++ {
		t := "topic_crawling"
		n.Sender(t, []byte(msg))
	}

	n.Stop()
}
