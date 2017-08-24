package head

import (
	"errors"
	"fmt"
	"net/http"
	"time"
)

//Checkip if the ip is a good performation ip and use distion
func Checkip(url string) (float64, error) {
	var err error
	begin := time.Now()
	resp, err := http.Head(url)

	if err == nil {
		if 200 == resp.StatusCode {
			err = nil
			fmt.Println("no deng yu 200")
		} else {
			fmt.Println("Status code: ", resp.StatusCode)
			err = errors.New(resp.Status)
		}
	}

	// dur := time.Since(begin).Nanoseconds()
	dur := time.Since(begin).Seconds()

	return dur, err
}

//CheckipWithProxy if the ip is a good performation ip and use distion
func CheckipWithProxy(url string, proxy string) (float64, error) {
	var err error
	begin := time.Now()
	resp, err := http.Head(url)

	if err == nil {
		if 200 == resp.StatusCode {
			err = nil
			fmt.Println("no deng yu 200")
		} else {
			fmt.Println("Status code: ", resp.StatusCode)
			err = errors.New(resp.Status)
		}
	}

	// dur := time.Since(begin).Nanoseconds()
	dur := time.Since(begin).Seconds()

	return dur, err
}
