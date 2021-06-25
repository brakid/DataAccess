package main

import (
	"fmt"
	"log"

	"github.com/brakid/dataaccess/service"
	"github.com/brakid/dataaccess/utils"
	"github.com/gin-gonic/gin"
)

func main() {

	fmt.Println("Started")
	/*client, err := ethclient.Dial("ws://127.0.0.1:9545/")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connection established")

	go service.ReceiveEvents(client)*/

	transactionSigner, err := utils.InstantiateTransactionSigner()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	r.GET("/provide", service.HandleProvide(transactionSigner))

	r.Run()
}
