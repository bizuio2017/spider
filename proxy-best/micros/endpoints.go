package micros

import (
	"context"
	"errors"

	"github.com/go-kit/kit/endpoint"
)

var (
	//ErrRequestTypeNotFound err
	ErrRequestTypeNotFound = errors.New("Request type only valid for word, sentence and paragraph")
)

type postBestProxyIPRequest struct {
	BestProxyIP BestProxyIP
}

type postBestProxyIPResponse struct {
	Err string `json:"err,omitempty"`
}

type getBestProxyIPRequest struct {
	ID string
}

type getBestProxyIPResponse struct {
	BestProxyIP BestProxyIP `json:"bestip,omitempty"`
	Err         string      `json:"err,omitempty"`
}

/////////////////////////////////////

//Endpoints endpoint module
type Endpoints struct {
	PostBestProxyIPEndpoint endpoint.Endpoint
	GetBestProxyIPEndpoint  endpoint.Endpoint
}

//MakePostBestProxyIPEndpoint make a endpoint
func MakePostBestProxyIPEndpoint(svc Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {

		req := request.(postBestProxyIPRequest)
		err := svc.PostBestProxyIP(ctx, req.BestProxyIP)
		return postBestProxyIPResponse{Err: err.Error()}, nil
	}
}

//MakeGetBestProxyIPEndpoint  make a endpoint
func MakeGetBestProxyIPEndpoint(svc Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(getBestProxyIPRequest)
		p, _ := svc.GetBestProxyIP(ctx, req.ID)
		// fmt.Println("calling...")
		// fmt.Printf("calling....MakeGetBestProxyIPEndpoint p=%v, err=%v \n", p, err)
		return getBestProxyIPResponse{BestProxyIP: *p, Err: p.Err}, nil
	}
}
