package nsqproducer

import "testing"

func TestSender(t *testing.T) {

	n := NewNsqSender()
	msg := "hello"

	for i := 0; i < 5; i++ {
		n.Sender([]byte(msg))
	}

	n.Stop()
}
