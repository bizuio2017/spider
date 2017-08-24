package head

import (
	"fmt"
	"testing"
)

func TestCheckip(t *testing.T) {
	url := "http://www.golang.org"
	dur, err := Checkip(url)

	fmt.Printf("during time: %vs,   status: %v", dur, err)

}
