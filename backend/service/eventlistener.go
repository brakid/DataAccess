package service

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"sync"

	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

func ReceiveEvents(client *ethclient.Client, receivedBuyEvents *sync.Map, contract *utils.Contract) {
	logs := make(chan types.Log)
	query := ethereum.FilterQuery{
		FromBlock: nil,
		ToBlock:   nil,
		Addresses: []common.Address{
			*contract.ContractAddress,
		},
	}
	sub, err := client.SubscribeFilterLogs(context.Background(), query, logs)
	if err != nil {
		log.Fatal(err)
	}

	for {
		select {
		case err := <-sub.Err():
			log.Fatal(err)
		case eventLog := <-logs:
			if eventLog.Topics[0].Hex() == contract.ContractAbi.Events["Buy"].ID.Hex() {
				buyEvent := utils.BuyEvent{}
				buyEvent.Timestamp = eventLog.Topics[1].Big()
				buyerAddress := common.HexToAddress(eventLog.Topics[2].Hex())
				buyEvent.BuyerAddress = &buyerAddress

				recordCounts, err := contract.ContractAbi.Unpack("Buy", eventLog.Data)
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
