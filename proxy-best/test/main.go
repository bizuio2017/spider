package main

import (
	"fmt"

	"techtoolkit.ickey.cn/proxy-best/test/head"
)

func main() {
	url := "http://www.golang.org"
	dur, err := head.Checkip(url)

	fmt.Printf("during time: %vs,   status: %v", dur, err)
}
