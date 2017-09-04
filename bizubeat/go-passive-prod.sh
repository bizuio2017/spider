#!/bin/sh


# Usage of bin/go-price-stock:
#  -config string
#    	go-price-stock config file (default "./etc/river.toml")
#  -data_dir string
#    	path for proRiver to save data
#  -es_addr string
#    	Elasticsearch addr
#  -exec string
#    	mysqldump execution path
#  -flavor string
#    	flavor: mysql or mariadb
#  -my_addr string
#    	MySQL addr
#  -my_pass string
#    	MySQL password
#  -my_user string
#    	MySQL user
#  -server_id int
#    	MySQL server id, as a pseudo slave
#
# for product running script

# only need config file name other param can use toml config file support

#!/bin/sh

server_bin="./bin/go-passive"
server_ini="./etc/passive.toml"
server_log="/var/log/go-passive-prod"

start_server()
{
        pid=`ps aux |grep $server_ini |grep -v grep| awk '{print $2}'`
        if [[ $pid -le 0 ]];then
                make clean
                make
                $server_bin  -config=$server_ini  > $server_log &
#                $server_bin  -config=$server_ini  > $server_log
                echo "start ok"
        else
                echo "started"
        fi
}

stop_server()
{
        pid=`ps aux |grep $server_ini |grep -v grep| awk '{print $2}'`
        if [[ $pid -gt 0 ]];then
                kill -9 $pid
                echo "stop ok"
        else
                echo "stopped"
        fi
}

rebuild()
{
        rm $server_bin
        make clean
        make
}

clean()
{
        make clean

}

case $1 in
        "start")
                stop_server
                clean
                rebuild
                start_server
                ;;
        "clean")
                clean
                ;;
        "make")
                rebuild
                ;;
        "stop")
                stop_server
                ;;
        "restart")
                stop_server
                start_server
                ;;
        *)
                echo "usage start|stop|restart|make|clean"
                ;;
esac
