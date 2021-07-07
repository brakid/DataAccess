package utils

import (
	"errors"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
)

type BuyEvent struct {
	Timestamp    *big.Int
	BuyerAddress *common.Address
	RecordCount  *big.Int
}

type EventIdentifier struct {
	BuyerAddress common.Address
	RecordCount  int64
}

type Contract struct {
	ContractAddress *common.Address
	ContractAbi     *abi.ABI
}

type TransactionSigner struct {
	Wallet        *hdwallet.Wallet
	SignerAccount *accounts.Account
}

type ProvideTransaction struct {
	RecordCount   int64           `json:"recordCount"`
	Timestamp     int64           `json:"timestamp"`
	SenderAddress *common.Address `json:"senderAddress"`
}

type SignedProvideTransaction struct {
	ProvideTransaction *ProvideTransaction `json:"provideTransaction"`
	Signature          string              `json:"signature"`
}

func CreateProvideTransaction(recordCount int64, senderAddress *common.Address) (*ProvideTransaction, error) {
	if recordCount <= 0 {
		return nil, errors.New("Invalid record count")
	}

	if senderAddress == nil {
		return nil, errors.New("Invalid sender address")
	}

	timestamp := time.Now().Unix()
	return &ProvideTransaction{recordCount, timestamp, senderAddress}, nil
}

type Record struct {
	Age    int64   `json:"age"`
	Weight float64 `json:"weight"`
	Height float64 `json:"height"`
}

type ProvideContent struct {
	Records       []Record `json:"records"`
	SenderAddress string   `json:"senderAddress"`
}

type BuyContent struct {
	RecordCount  int64  `json:"recordCount"`
	BuyerAddress string `json:"buyerAddress"`
}
