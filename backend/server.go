package main

import (
	"context"
	"fmt"
	"log"

	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum/ethclient"
)

func main() {
	fmt.Println("Started")

	client, err := ethclient.Dial("http://localhost:9545")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connection established")

	_, account, err := utils.InstantiateWallet()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(account.Address.Hex())

	balance, err := client.BalanceAt(context.Background(), account.Address, nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(balance)
}
