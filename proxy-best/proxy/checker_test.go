package proxy

import (
	"fmt"
	"log"
	"testing"

	"github.com/stanxii/iccrawler/proxy-best/daxiang"
)

func TestGetBestIP(t *testing.T) {

	s := "http://vip22.daxiangdaili.com/ip/?tid=555500208019393&num="
	n := 20
	urls, err := daxiang.GetDaxiangIPS(s, n)
	if err != nil {
		fmt.Printf("urls err=%v \n", err)
	}

	for _, ul := range urls {
		fmt.Printf("url=%s\n", ul)
	}

	u, dur, err := GetBestIP(urls)
	if err != nil {
		fmt.Printf("Err:GetBestip=%v\n", err)
	}
	fmt.Printf("Final get the best ip=%s spend=%v  err=%v\n", u, dur, err)

}

func TestCheckProxyServer(t *testing.T) {

	u := "175.155.24.5:808"
	dur, err := CheckProxyServer(u)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("dailing proxy server spend:%v seconds.", dur)
}

func TestCheckBestProxyServer(t *testing.T) {
	us := []string{
		"115.213.253.107:808",
		"182.42.37.66:29358",
		"101.53.101.172:9999",
		"117.79.87.165:80",
		"123.231.65.170:8080",
		"222.178.177.93:8998",
		"171.8.170.6:23904",
		"111.72.229.120:808",
		"175.155.70.164:808",
		"188.167.177.126:80",
		"202.202.90.20:8080",
		"59.62.98.20:808",
		"175.155.24.18:808",
		"111.72.155.226:808",
		"113.69.215.156:808",
		"185.138.206.205:8080",
		"1.183.199.119:80",
		"36.45.166.225:8998",
		"115.213.238.133:808",
		"94.177.242.57:8118",
	}

	i := 0
	var durB float64
	best := ""
	for _, u := range us {
		dur, err := CheckProxyServer(u)
		if err != nil {
			// fmt.Printf("\nXXXXXX error server:%v err:%v.\n", u, err)
			continue
		}
		fmt.Printf("\ndailing proxy server:%v spend:%v seconds.\n", u, dur)
		if 0 == i {
			best = u
			durB = dur
			i++
		} else {
			if dur < durB {
				fmt.Printf("\nbest.... dailing proxy server:%v spend:%v seconds.\n", u, dur)
				best = u
				durB = dur
			}
		}

	}

	fmt.Printf("now best url: %v dur=%v \n", best, durB)
}
