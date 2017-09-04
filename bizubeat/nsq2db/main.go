package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/elastic/beats/libbeat/logp"
	"github.com/nsqio/go-nsq"

	// Import GORM-related packages.
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var (
	done chan bool
	//test
	nsqaddr = "10.8.15.9:4161"
	isDebug = true

	//product
	// nsqaddr = "10.8.51.50:4161"
	// isDebug = false
)
var total uint64
var begin time.Time

type TProSellStock struct {
	// gorm.Model
	ID         int64
	Sku        int64     `gorm:"column:sku"`
	Stocknum   int64     `gorm:"column:stock_num"`
	Frozennum  int64     `gorm:"column:frozen_num"`
	Virtualnum int64     `gorm:"column:virtual_num"`
	LastUpTime int64     `gorm:"column:last_update_time"`
	LUptime    time.Time `gorm:"column:luptime"`
}

type TProSellPrice struct {
	// gorm.Model
	ID         int64
	MysqlID    int64     `gorm:"column:mysql_id"`
	ProSellID  int64     `gorm:"column:pro_sell_id"`
	Sku        int64     `gorm:"column:sku"`
	PriceType  int64     `gorm:"column:price_type"`
	CurrencyID int64     `gorm:"column:currency_id"`
	Price1     float64   `gorm:"type:decimal(15,6);"`
	Number1    int64     `gorm:"column:number1"`
	Price2     float64   `gorm:"type:decimal(15,6);"`
	Number2    int64     `gorm:"column:number2"`
	Price3     float64   `gorm:"type:decimal(15,6);"`
	Number3    int64     `gorm:"column:number3"`
	Price4     float64   `gorm:"type:decimal(15,6);"`
	Number4    int64     `gorm:"column:number4"`
	Price5     float64   `gorm:"type:decimal(15,6);"`
	Number5    int64     `gorm:"column:number5"`
	Price6     float64   `gorm:"type:decimal(15,6);"`
	Number6    int64     `gorm:"column:number6"`
	Price7     float64   `gorm:"type:decimal(15,6);"`
	Number7    int64     `gorm:"column:number7"`
	Price8     float64   `gorm:"type:decimal(15,6);"`
	Number8    int64     `gorm:"column:number8"`
	Price9     float64   `gorm:"type:decimal(15,6);"`
	Number9    int64     `gorm:"column:number9"`
	Price10    float64   `gorm:"type:decimal(15,6);"`
	Number10   int64     `gorm:"column:number10"`
	Status     int64     `gorm:"column:status"`
	LastUpTime int64     `gorm:"column:last_update_time"`
	OpAdminID  int64     `gorm:"column:op_admin_id"`
	LUptime    time.Time `gorm:"column:luptime"`
}

//TProSellPrice tablename
func (TProSellPrice) TableName() string {
	return "t_pro_sell_szlcsc"
}

//Handle h
type Handle struct {
	msgchan chan *nsq.Message
	db      *gorm.DB
	done    chan bool
}

//HandleMsg handle msg
func (h *Handle) HandleMsg(m *nsq.Message) error {
	h.msgchan <- m
	return nil
}

//Process p
func (h *Handle) Process() {
	for {
		select {
		case m := <-h.msgchan:
			h.DoProcess(m)
		case <-h.done:
			fmt.Println("exist from nsq.")
			return
		}
	}
}

type Message struct {
	Cmd  string `json:"cmd"`
	Data json.RawMessage
}

//DoProcess doprocess.
func (h *Handle) DoProcess(m *nsq.Message) error {
	fmt.Println("NSQ receive ms", string(m.Body))

	var msg Message

	if err := json.Unmarshal(m.Body, &msg); err != nil {
		fmt.Println("#### json.Unmashal rawMessage err", err, string(m.Body))
		return err
	}

	switch msg.Cmd {
	case "c_price":
		var p TProSellPrice
		if err := json.Unmarshal([]byte(msg.Data), &p); err != nil {
			fmt.Print("json convert data error ", err, msg.Data)
		}

		h.DoPriceStorage(&p)
	case "c_stock":
		var s TProSellStock
		if err := json.Unmarshal([]byte(msg.Data), &s); err != nil {
			fmt.Print("json convert data error ", err, msg.Data)
		}
		h.DoStockStorage(s)
	default:
		fmt.Println("Bad command")
		return errors.New("Bad command")
	}

	return nil

}

func init() {

}

func getconnection(isDebug bool) (*gorm.DB, error) {
	var addr string
	if isDebug {
		fmt.Println("Debuging.. model.......")
		addr = "postgresql://stan:888888@10.8.15.167:26257/db_product?sslmode=disable"
	} else {
		fmt.Println("Production.. model.......")
		addr = "postgresql://stan@10.8.51.69:26257/db_product?sslcert=/usr/local/ickey-certs/client-stan/client.stan.crt&sslkey=/usr/local/ickey-certs/client-stan/client.stan.key&sslrootcert =/usr/local/ickey-certs/client-stan/ca.crt&sslmode=require"
	}

	db, err := gorm.Open("postgres", addr)
	if err != nil {
		fmt.Println("connect cockroach db error")
		log.Fatal(err)
	}
	db.DB().SetMaxOpenConns(1)

	return db, nil

}

func (h *Handle) DoStockStorage(stock TProSellStock) error {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("recoverd in DoStorage. err:", err)
			//log.Info("error: %v", err)
		}
	}()

	// Simple progress
	current := atomic.AddUint64(&total, 1)
	dur := time.Since(begin).Seconds()
	sec := int(dur)
	pps := int64(float64(current) / dur)
	fmt.Printf("%10d | %6d req/s | %02d:%02d\r", current, pps, sec/60, sec%60)

	stock.LUptime = time.Now()

	if h.db.Where(map[string]interface{}{"sku": stock.Sku}).Find(&TProSellStock{}).RecordNotFound() {
		err := h.db.Create(&stock)
		if err != nil {
			return err.Error
		}
	}

	return nil
}

func (h *Handle) DoPriceStorage(p *TProSellPrice) error {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("recoverd in Price DoStorage. err:", err)
			//log.Info("error: %v", err)
		}
	}()

	price := *p

	// Simple progress
	current := atomic.AddUint64(&total, 1)
	dur := time.Since(begin).Seconds()
	sec := int(dur)
	pps := int64(float64(current) / dur)
	fmt.Printf("%10d | %6d req/s | %02d:%02d\r", current, pps, sec/60, sec%60)

	if price.Price1 >= -0.0000001 && price.Price1 <= 0.0000001 {
		price.Price1 = 0.0000001
	}
	if price.Price2 >= -0.0000001 && price.Price2 <= 0.0000001 {
		price.Price2 = 0.0000001
	}
	if price.Price3 >= -0.0000001 && price.Price3 <= 0.0000001 {
		price.Price3 = 0.0000001
	}
	if price.Price4 >= -0.0000001 && price.Price4 <= 0.0000001 {
		price.Price4 = 0.0000001
	}
	if price.Price5 >= -0.0000001 && price.Price5 <= 0.0000001 {
		price.Price5 = 0.0000001
	}
	if price.Price6 >= -0.0000001 && price.Price6 <= 0.0000001 {
		price.Price6 = 0.0000001
	}
	if price.Price7 >= -0.0000001 && price.Price7 <= 0.0000001 {
		price.Price7 = 0.0000001
	}
	if price.Price8 >= -0.0000001 && price.Price8 <= 0.0000001 {
		price.Price8 = 0.0000001
	}
	if price.Price9 >= -0.0000001 && price.Price9 <= 0.0000001 {
		price.Price9 = 0.0000001
	}
	if price.Price10 >= -0.0000001 && price.Price10 <= 0.0000001 {
		price.Price10 = 0.0000001
	}

	price.LUptime = time.Now()
	old := TProSellPrice{}
	if h.db.Where("mysql_id = ?", price.MysqlID).First(&old).RecordNotFound() {
		err := h.db.Create(&price)
		if err != nil {
			fmt.Printf("Err busy buff####XXXXX 333333 create price err: %v  , cock price: %v    \n", err.Error.Error(), price)
			return err.Error
		}
	} else {
		// log .Println("have alread exist mysqlid", price.MysqlID)
		fmt.Println("Cockroach db had alreay exists row.", price.MysqlID)
		logp.Err("Err rows.Columns() #%v error ws:", price.MysqlID)
	}

	return nil
}

//Stop done.
func (h *Handle) Stop() {
	defer h.db.Close()
	h.done <- true
}

type LetsGO struct {
	hs []*Handle
}

func main() {

	//os signal
	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	l := new(LetsGO)

	for i := 0; i < 100; i++ {
		h := new(Handle)
		l.hs = append(l.hs, h)
		h.done = make(chan bool, 1)
		go func(h *Handle) {
			worker(h)
		}(h)
	}

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		fmt.Println()
		fmt.Println(sig)
		for _, h := range l.hs {
			h.Stop()
		}
		//after close for loop 3 second exist main
		select {
		case <-time.After(time.Second * 3):
			fmt.Println("receive signal termnal.")
			done <- true
		}

	}()

	// The program will wait here until it gets the
	// expected signal (as indicated by the goroutine
	// above sending a value on `done`) and then exit.
	fmt.Println("awaiting signal")
	<-done

	//send to nsq exist for loop.
	fmt.Println("exiting")
}

func worker(h *Handle) {
	// 建立「已接收」頻道，作為是否接收到訊息的一個開關。
	// 建立空白設定檔。
	config := nsq.NewConfig()

	c, err := nsq.NewConsumer("topic_cock", "channel_price", config)
	if err != nil {
		panic(err)
	}

	db, err := getconnection(isDebug)
	if err != nil || db == nil {
		fmt.Println("connection cockroach error")
		panic(err)
	}
	h.db = db

	c.AddHandler(nsq.HandlerFunc(h.HandleMsg))

	h.msgchan = make(chan *nsq.Message, 1024)
	// 連線到 NSQ 叢集，而不是單個 NSQ，這樣更安全與可靠。
	err1 := c.ConnectToNSQLookupd(nsqaddr)
	// err1 := c.ConnectToNSQD(nsqaddr)

	if err1 != nil {
		log.Panic("連線失敗。")
		panic(err1)
	}
	go h.Process()
}
