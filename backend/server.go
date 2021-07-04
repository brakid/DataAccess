package main

import (
	"fmt"
	"log"
	"sync"

	"github.com/brakid/dataaccess/service"
	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
)

func main() {
	contractAbi, err := utils.GetContractAbi()
	if err != nil {
		log.Fatal(err)
	}

	contractAddress := common.HexToAddress("0x734A805767578Da71b6c7B13fd9DdbDaC2b55238")
	contract := utils.Contract{ContractAddress: &contractAddress, ContractAbi: contractAbi}

	receivedBuyEvents := sync.Map{}

	fmt.Println("Started")
	client, err := ethclient.Dial("ws://127.0.0.1:9545/")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connection established")

	go service.ReceiveEvents(client, &receivedBuyEvents, &contract)

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
