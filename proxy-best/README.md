# how to use micros to get best proxy ip

# start micros Service
```
cd proxy-best/micros
go run micros.d/main.go
....show
$ go run micros.d/main.go
Starting server at port 9999
```

# request
```
POST localhost:9999/api/v1/bestapi -d '
{
"s": "getbestip"
}'
```
# response
```
{
  "v": "5.187.195.33:8080"
}
```
