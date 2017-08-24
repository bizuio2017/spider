package daxiang

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"
)

//DaxiangResponse json response from ndoe.js struct
// type DaxiangResponse struct {
// 	// Err string   `json:"err"`
// 	Ips []string `json:"ips"`
// }

//GetDaxiangIPS get ipx
// timeout := time.Duration(3 * time.Second)
// req, err := http.NewRequest("GET", u, nil)
// if err != nil {
// 	fmt.Println("read res body", err2)
//   return nil, err
// }
// ctx, _ := context.WithTimeout(context.Background(), timeout)
// res, err := client.Get(req.WithContext(ctx))
//http://vip22.daxiangdaili.com/ip/?tid=555500208019393&num=1
//CheckipWithProxy if the ip is a good performation ip and use distion
func GetDaxiangIPS(us string, n int) ([]string, error) {
	begin := time.Now()

	s := fmt.Sprintf("%s%d", us, n)
	u, _ := url.Parse(s)
	resp, err := http.Get(u.String())
	if err != nil {
		fmt.Println("Status code: ", err)
		return nil, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("read res body", err)
		return nil, err
	}

	// fmt.Printf("http get body: \n%s \n", string(body))
	sd := string(body)
	ips := strings.Split(sd, "\n")

	// dur := time.Since(begin).Nanoseconds()
	dur := time.Since(begin).Seconds()
	fmt.Printf("Get daxiang %d ips spend time:%v Seconds.\n", n, dur)

	return ips, nil
}
