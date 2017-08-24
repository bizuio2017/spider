package proxy

import (
	"errors"
	"net"
	"time"
)

//CheckProxyServer
func CheckProxyServer(proxy string) (float64, error) {
	start := time.Now()

	conn, err := net.DialTimeout("tcp", proxy, 2*time.Second)
	if err != nil {
		//fmt.Printf("\nproxy ip: %v, err:%v .\n", proxy, err)
		// defer conn.Close()
		return 0.0, err
	}
	conn.Close()
	dur := time.Since(start).Seconds()
	return dur, err
}

func GetBestIP(us []string) (string, float64, error) {

	i := 0
	var durB float64

	best := ""
	for _, u := range us {
		dur, err := CheckProxyServer(u)
		if err != nil {
			//fmt.Printf("\nXXXXXX error server:%v err:%v.\n", u, err)
			continue
		}
		//fmt.Printf("\ndailing proxy server:%v spend:%v seconds.\n", u, dur)
		if 0 == i {
			best = u
			durB = dur
			i++
		} else {
			if dur < durB {
				//fmt.Printf("\nbest.... dailing proxy server:%v spend:%v seconds.\n", u, dur)
				best = u
				durB = dur
			}
		}

	}

	//fmt.Printf("now best url: %v dur=%v \n", best, durB)

	if best == "" {
		err := errors.New("does not get ip")
		return best, durB, err
	}

	return best, durB, nil
}
