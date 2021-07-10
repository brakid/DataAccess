package main

import (
	"log"
	"sync"

	"github.com/brakid/dataaccess/database"
	"github.com/brakid/dataaccess/service"
	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	contractAddress := common.HexToAddress(utils.Get("CONTRACT_ADDRESS", "0x734A805767578Da71b6c7B13fd9DdbDaC2b55238"))
	contractFile := utils.Get("CONTRACT_FILE", "./abi/DataProviderToken.json")
	mnemonic := utils.Get("MNEMONIC", "impose believe guitar thrive clean tourist attitude edge swim stuff salon tiny")
	ethereumAddress := utils.Get("ETHEREUM_ADDRESS", "ws://127.0.0.1:9545/")

	contractAbi, err := utils.GetContractAbi(contractFile)
	if err != nil {
		log.Fatal(err)
	}
	contract := utils.Contract{ContractAddress: &contractAddress, ContractAbi: contractAbi}

	receivedBuyEvents := sync.Map{}

	log.Println("Started")
	client, err := ethclient.Dial(ethereumAddress)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connection established")

	go service.ReceiveEvents(client, &receivedBuyEvents, &contract)

	transactionSigner, err := utils.InstantiateTransactionSigner(mnemonic)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Signer account: %v\n", transactionSigner.SignerAccount.Address.Hex())

	inMemoryDatabase := database.InstantiateDatabase()

	gin.ForceConsoleColor()
	r := gin.Default()

	r.Use(cors.Default())

	r.POST("/provide", service.HandleProvide(inMemoryDatabase, transactionSigner))
	r.POST("/buy", service.HandleBuy(inMemoryDatabase, &receivedBuyEvents))
	r.GET("/records", service.HandleRecordCount(inMemoryDatabase))

	r.Run()
}
