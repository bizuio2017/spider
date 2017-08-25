package beat

type Beater interface {
	// The main event loop. This method should block util signalled to stop by an
	// invocation of the Stop() method
	Run(b *Beat) error

	// Stop is invoked to signal that the Run method should finish its execution.
	// It will be invoked at most once.
	Stop()
}

// Beat contains the basic beat data and the publisher client used to publisher events.
type Beat struct {
	Publisher string

	Config *BeatConfig
}

//Nsq addr topic channel config
type BeatConfig struct {
	Addr    string
	Topic   string
	Channel string
}
