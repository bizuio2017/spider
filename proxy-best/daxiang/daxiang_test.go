package daxiang

import (
	"fmt"
	"testing"
)

func TestGetDaxiangIPS(t *testing.T) {

	u := "http://vip22.daxiangdaili.com/ip/?tid=555500208019393&num="
	n := 20
	urls, err := GetDaxiangIPS(u, n)
	if err != nil {
		fmt.Printf("urls err=%v \n", err)
	}

	for _, ul := range urls {
		fmt.Printf("url=%s\n", ul)
	}
}
