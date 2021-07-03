package service

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"strings"
	"sync"

	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

func ReceiveEvents(client *ethclient.Client, receivedBuyEvents *sync.Map) {
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
			if eventLog.Topics[0].Hex() == contractAbi.Events["Buy"].ID.Hex() {
				buyEvent := utils.BuyEvent{}
				buyEvent.Timestamp = eventLog.Topics[1].Big()
				buyerAddress := common.HexToAddress(eventLog.Topics[2].Hex())
				buyEvent.BuyerAddress = &buyerAddress

				recordCounts, err := contractAbi.Unpack("Buy", eventLog.Data)
				if err != nil {
					log.Fatal(err)
				}
				recordCount := recordCounts[0].(*big.Int)
				buyEvent.RecordCount = recordCount

				fmt.Println(buyEvent)

				eventIdentifier := utils.EventIdentifier{}
				eventIdentifier.BuyerAddress = *buyEvent.BuyerAddress
				eventIdentifier.RecordCount = buyEvent.RecordCount.Int64()

				receivedBuyEvents.Store(eventIdentifier, &buyEvent)
			}
		}
	}
}
