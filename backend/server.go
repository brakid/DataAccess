package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strconv"
	"strings"

	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
)

type Transfer struct {
	From   common.Address
	To     common.Address
	Amount *big.Int
}

func receiveEvents(client *ethclient.Client) {
	logs := make(chan types.Log)
	contractAddress := common.HexToAddress("0xC7CF75B1A17c21BD9DdF84BB0BC15736e8096Df3")
	query := ethereum.FilterQuery{
		FromBlock: nil,
		ToBlock:   nil,
		Addresses: []common.Address{
			contractAddress,
		},
	}
	sub, err := client.SubscribeFilterLogs(context.Background(), query, logs)
	if err != nil {
		log.Fatal(err)
	}

	contractAbi, err := abi.JSON(strings.NewReader("[{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\",\"signature\":\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\"}]"))
	if err != nil {
		log.Fatal(err)
	}

	for {
		select {
		case err := <-sub.Err():
			log.Fatal(err)
		case eventLog := <-logs:
			if eventLog.Topics[0].Hex() == contractAbi.Events["Transfer"].ID.Hex() {
				transferEvent := Transfer{}
				transferEvent.From = common.HexToAddress(eventLog.Topics[1].Hex())
				transferEvent.To = common.HexToAddress(eventLog.Topics[2].Hex())

				amounts, err := contractAbi.Unpack("Transfer", eventLog.Data)
				if err != nil {
					log.Fatal(err)
				}
				amount := amounts[0].(*big.Int)
				transferEvent.Amount = amount

				fmt.Println(transferEvent)
			}
		}
	}
}

func main() {

	fmt.Println("Started")
	/*client, err := ethclient.Dial("ws://127.0.0.1:9545/")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connection established")

	go receiveEvents(client)*/

	wallet, account, err := utils.InstantiateWallet()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()
	r.GET("/provide", func(context *gin.Context) {
		recordCountString := context.Query("recordCount")
		senderAddressString := context.Query("senderAddress")

		recordCount, err := strconv.ParseInt(recordCountString, 10, 64)
		if err != nil {
			context.String(http.StatusBadRequest, "Invalid record count")
			return
		}

		if common.IsHexAddress(senderAddressString) == false {
			context.String(http.StatusBadRequest, "Invalid Sender Address")
			return
		}

		senderAddress := common.HexToAddress(senderAddressString)

		provideTransaction, err := utils.CreateProvideTransaction(recordCount, &senderAddress)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		signedProvideTransaction, err := utils.SignProvideTransaction(provideTransaction, wallet, account)
		if err != nil {
			context.String(http.StatusInternalServerError, err.Error())
			return
		}

		context.JSON(http.StatusOK, gin.H{
			"message": signedProvideTransaction,
		})
		return
	})
	r.Run()
}
