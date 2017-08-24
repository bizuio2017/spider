package proxy

import (
	"crypto/tls"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/stanxii/iccrawler/proxy-best/config"
)

// Proxy is an HTTP proxy server.
type Proxy struct {
	// from the given IP address. If unspecified, all connections are allowed.
	httpClient *http.Client
	config     *config.Config
}

//NewProxy proxy instance
func NewProxy(config config.Config) *Proxy {
	timeout := time.Duration(5 * time.Second)

	// client.Get(url)
	// proxyUrl, err := url.Parse("http://proxyIp:proxyPort")
	u, _ := url.Parse("http://" + config.DaxiangApi)

	tr := &http.Transport{
		Proxy:           http.ProxyURL(u),
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		TLSNextProto:    make(map[string]func(authority string, c *tls.Conn) http.RoundTripper),
	}

	client := &http.Client{
		Timeout:   timeout,
		Transport: tr,
	}

	proxy := &Proxy{
		httpClient: client,
	}

	return proxy
}

func (p *Proxy) proxyGet(url string) (string, error) {
	_, err := p.httpClient.Get("http://example.com") // do request through proxy
	// defer resp.Body.Close()
	if err != nil {
		log.Printf("http proxy get error: %v", err)
	}

	return "ok", nil
}
