package micros

import (
	"context"
	"errors"
	"fmt"

	"github.com/stanxii/iccrawler/proxy-best/daxiang"
	"github.com/stanxii/iccrawler/proxy-best/proxy"
)

//Service picker the best proxy ip from proxypool
type Service interface {
	PostBestProxyIP(ctx context.Context, b BestProxyIP) error
	GetBestProxyIP(ctx context.Context, id string) (*BestProxyIP, error)
}

//BestProxyIP best
type BestProxyIP struct {
	Status int     `json:"status"`
	ID     string  `json:"id"`
	IP     string  `json:"ip"`
	Dur    float64 `json:"dur"`
	Err    string  `json:"err,omitempty"`
}

//ProxyIPService type
type ProxyIPService struct {
}

//GetBestProxyIP ., error)
func (ProxyIPService) GetBestProxyIP(ctx context.Context, id string) (*BestProxyIP, error) {
	//import sync
	// s.mtx.RLock()
	// defer s.mtx.RUnlock()

	best := ""
	var err error

	s := "http://vip22.daxiangdaili.com/ip/?tid=555500208019393&num="
	n := 25
	urls, err := daxiang.GetDaxiangIPS(s, n)
	if err != nil {
		fmt.Printf("urls err=%v \n", err)
	}

	for i, ul := range urls {
		fmt.Printf("daxiang[%d]=%v\n", i, ul)
	}

	best, dur, err := proxy.GetBestIP(urls)
	if err != nil {
		fmt.Printf("Err:GetBestip=%v\n", err)
		return &BestProxyIP{
			Status: 1,
			ID:     id,
			IP:     best,
			Dur:    dur,
			Err:    err.Error(),
		}, ErrNotFound
	}
	fmt.Printf("Final xx get the best ip=%s spend=%v  err=%v\n", best, dur, err)

	fmt.Printf("oo id=%v, best=%v ", id, best)

	return &BestProxyIP{
		Status: 0,
		ID:     id,
		IP:     best,
		Dur:    dur,
		Err:    "",
	}, nil
}

//PostBestProxyIP Implemented
func (ProxyIPService) PostBestProxyIP(ctx context.Context, b BestProxyIP) error {

	fmt.Println("......Now is calling GetBestProxyIP micro services.")

	best := ""
	var err error

	s := "http://vip22.daxiangdaili.com/ip/?tid=555500208019393&num="
	n := 20
	urls, err := daxiang.GetDaxiangIPS(s, n)
	if err != nil {
		fmt.Printf("urls err=%v \n", err)
	}

	// for _, ul := range urls {
	// 	fmt.Printf("url=%s\n", ul)
	// }

	best, dur, err := proxy.GetBestIP(urls)
	if err != nil {
		fmt.Printf("Err:GetBestip=%v\n", err)
	}
	fmt.Printf("Final get the best ip=%s spend=%v  err=%v\n", best, dur, err)

	return err
}

// ErrEmpty is returned when an input string is empty.
var ErrEmpty = errors.New("empty string")

//ErrNotFound is returned when an input string is empty.
var ErrNotFound = errors.New("not found")
