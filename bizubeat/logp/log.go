package logp

import (
	"fmt"
	"os"

	log "github.com/sirupsen/logrus"
)

//log
type Log struct {
	f *os.File
}

//NewLog new
func NewLog() *Log {
	l := &Log{}

	return l
}

//Init ocsv
func (l *Log) Init(fname string) error {
	// t := time.Now().Format("2006-01-02-15-04-05")
	// t := time.Now().Unix()
	// fname := strconv.FormatInt(t, 10)

	f, err := os.OpenFile(fname, os.O_RDWR|os.O_CREATE|os.O_APPEND, os.ModePerm)
	if err != nil {
		fmt.Println("crate log file error.")
		return err
	}
	l.f = f

	fmt.Println("loginit", f)

	log.SetFormatter(&log.JSONFormatter{})

	log.SetOutput(f)

	log.SetLevel(log.DebugLevel)

	return nil
}

func (l *Log) Info(msg string) error {
	log.WithFields(log.Fields{
		"animal": "stan",
		"size":   10,
	}).Info(msg)

	return nil
}

func (l *Log) Debug(msg string) error {
	log.WithFields(log.Fields{
		"animal": "stan",
		"size":   10,
	}).Debug(msg)

	return nil
}

func (l *Log) Error(msg string) error {
	log.WithFields(log.Fields{
		"animal": "stan",
		"size":   10,
	}).Error(msg)

	return nil
}

func (l *Log) Close() error {
	defer l.f.Close()
	return nil
}
