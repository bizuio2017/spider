package server

import (
	"net"
	"net/http"
	"reflect"

	"github.com/getlantern/golog"
	"github.com/getlantern/http-proxy/listeners"
	"github.com/getlantern/tlsdefaults"

	mainlog "github.com/cihub/seelog"

	"github.com/stanxii/iccrawler/proxy-best/config"
	"github.com/stanxii/iccrawler/proxy-best/proxy"
)

var (
	testingLocal = false
	log          = golog.LoggerFor("server")
)

type listenerGenerator func(net.Listener) net.Listener

// Server is an HTTP proxy server.
type Server struct {
	// Allow is a function that determines whether or not to allow connections
	// from the giNewConnBagven IP address. If unspecified, all connections are allowed.
	Allow              func(string) bool
	httpServer         http.Server
	listenerGenerators []listenerGenerator
	p                  *proxy.Proxy
	c                  *config.Config
	Seelog             *mainlog.LoggerInterface
}

// NewServer constructs a new HTTP proxy server using the given handler.
func NewServer(handler http.Handler) *Server {
	cb := NewConnBag()

	//init seelog
	Seelog, _ := mainlog.LoggerFromConfigAsFile("etc/seelog-proxy-best.xml")

	server := &Server{
		httpServer: http.Server{

			ConnState: func(c net.Conn, state http.ConnState) {
				wconn, ok := c.(listeners.WrapConn)
				if !ok {
					panic("Should be of type WrapConn")
				}

				wconn.OnState(state)

				switch state {
				case http.StateActive:
					cb.Put(wconn)
				case http.StateClosed:
					// When go server encounters abnormal request, it
					// will transit to StateClosed directly without
					// the handler being invoked, hence the connection
					// will not be withdrawed. Purge it in such case.
					cb.Purge(c.RemoteAddr().String())
				}
			},
			ErrorLog: log.AsStdLogger(),
		},
	}

	server.Seelog = &Seelog

	return server
}

func (s *Server) AddListenerWrappers(listenerGens ...listenerGenerator) {
	for _, g := range listenerGens {
		s.listenerGenerators = append(s.listenerGenerators, g)
	}
}

func (s *Server) ListenAndServeHTTP(addr string, readyCb func(addr string)) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	log.Debugf("Listen http on %s", addr)
	return s.Serve(s.wrapListenerIfNecessary(listener), readyCb)
}

func (s *Server) ListenAndServeHTTPS(addr, keyfile, certfile string, readyCb func(addr string)) error {
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	listener, err := tlsdefaults.NewListener(s.wrapListenerIfNecessary(l), keyfile, certfile)
	if err != nil {
		return err
	}
	log.Debugf("Listen https on %s", addr)
	return s.Serve(listener, readyCb)
}

func (s *Server) Serve(listener net.Listener, readyCb func(addr string)) error {
	l := listeners.NewDefaultListener(listener)

	for _, wrap := range s.listenerGenerators {
		l = wrap(l)
	}

	if readyCb != nil {
		readyCb(l.Addr().String())
	}

	return s.httpServer.Serve(l)
}

func (s *Server) wrapListenerIfNecessary(l net.Listener) net.Listener {
	if s.Allow != nil {
		log.Debug("Wrapping listener with Allow")
		return &allowinglistener{l, s.Allow}
	}
	return l
}

type allowinglistener struct {
	wrapped net.Listener
	allow   func(string) bool
}

func (l *allowinglistener) Accept() (net.Conn, error) {
	conn, err := l.wrapped.Accept()
	if err != nil {
		return conn, err
	}

	ip := ""
	remoteAddr := conn.RemoteAddr()
	switch addr := remoteAddr.(type) {
	case *net.TCPAddr:
		ip = addr.IP.String()
	case *net.UDPAddr:
		ip = addr.IP.String()
	default:
		log.Errorf("Remote addr %v is of unknown type %v, unable to determine IP", remoteAddr, reflect.TypeOf(remoteAddr))
		return conn, err
	}
	if !l.allow(ip) {
		conn.Close()
		// Note - we don't return an error, because that causes http.Server to stop
		// serving.
	}

	return conn, err
}

func (l *allowinglistener) Close() error {
	return l.wrapped.Close()
}

func (l *allowinglistener) Addr() net.Addr {
	return l.wrapped.Addr()
}
