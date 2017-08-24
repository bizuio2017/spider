package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-kit/kit/log"

	"github.com/stanxii/iccrawler/proxy-best/micros"
)

func main() {
	ctx := context.Background()
	errChan := make(chan error)

	var svc micros.Service
	svc = micros.ProxyIPService{}
	endpoint := micros.Endpoints{
		PostBestProxyIPEndpoint: micros.MakePostBestProxyIPEndpoint(svc),
		GetBestProxyIPEndpoint:  micros.MakeGetBestProxyIPEndpoint(svc),
	}

	// Logging domain.
	var logger log.Logger
	{
		logger = log.NewLogfmtLogger(os.Stderr)
		logger = log.With(logger, "ts", log.DefaultTimestampUTC)
		logger = log.With(logger, "caller", log.DefaultCaller)
	}

	r := micros.MakeHTTPHandler(ctx, endpoint, logger)

	// HTTP transport
	go func() {
		fmt.Println("Starting server at port 9999")
		handler := r
		errChan <- http.ListenAndServe(":9999", handler)
	}()

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
		errChan <- fmt.Errorf("%s", <-c)
	}()
	fmt.Println(<-errChan)
}
