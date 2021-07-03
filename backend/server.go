package main

import (
	"fmt"
	"log"
	"sync"

	"github.com/brakid/dataaccess/service"
	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
)

func main() {
	receivedBuyEvents := sync.Map{}

	fmt.Println("Started")
	client, err := ethclient.Dial("ws://127.0.0.1:9545/")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connection established")

	go service.ReceiveEvents(client, &receivedBuyEvents)

	transactionSigner, err := utils.InstantiateTransactionSigner()
	if err != nil {
		log.Fatal(err)
	}

	gin.ForceConsoleColor()
	r := gin.Default()

	r.GET("/provide", service.HandleProvide(transactionSigner))
	r.GET("/buy", service.HandleBuy(&receivedBuyEvents))

	r.Run()
}
