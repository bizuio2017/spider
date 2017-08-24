package micros

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-kit/kit/log"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/gorilla/mux"
)

var (
	// ErrBadRouting is returned when an expected path variable is missing.
	ErrBadRouting = errors.New("inconsistent mapping between route and handler (programmer error)")
)

//MakeHTTPHandler make http handler
func MakeHTTPHandler(ctx context.Context, endpoint Endpoints, logger log.Logger) http.Handler {

	r := mux.NewRouter()
	options := []httptransport.ServerOption{
		httptransport.ServerErrorLogger(logger),
		httptransport.ServerErrorEncoder(encodeError),
	}

	r.Methods("GET").Path("/api/v1/getip/{id}").Handler(httptransport.NewServer(
		endpoint.GetBestProxyIPEndpoint,
		decodeGetBestProxyIPRequest,
		encodeResponse,
		options...,
	))

	//POST api get best proxy ip
	r.Methods("POST").Path("/api/v1/bestapi").Handler(httptransport.NewServer(
		endpoint.PostBestProxyIPEndpoint,
		decodePostBestProxyIPRequest,
		encodeResponse,
		options...,
	))

	return r
}

// errorer is implemented by all concrete response types that may contain
// errors. It allows us to change the HTTP response code without needing to
// trigger an endpoint (transport-level) error.
type errorer interface {
	error() error
}

func decodeGetBestProxyIPRequest(_ context.Context, r *http.Request) (interface{}, error) {
	vars := mux.Vars(r)
	id, ok := vars["id"]
	if !ok {
		fmt.Println("param err.")
		return nil, ErrBadRouting
	}
	return getBestProxyIPRequest{ID: id}, nil
}

func decodePostBestProxyIPRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var req postBestProxyIPRequest
	if err := json.NewDecoder(r.Body).Decode(&req.BestProxyIP); err != nil {
		return nil, err
	}
	return req, nil
}

func encodeResponse(ctx context.Context, w http.ResponseWriter, response interface{}) error {
	if e, ok := response.(errorer); ok && e.error() != nil {
		// Not a Go kit transport error, but a business-logic error.
		// Provide those as HTTP errors.
		encodeError(ctx, e.error(), w)
		return nil
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	return json.NewEncoder(w).Encode(response)
}

// encode error
func encodeError(_ context.Context, err error, w http.ResponseWriter) {
	if err == nil {
		panic("encodeError with nil error")
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error": err.Error(),
	})
}
