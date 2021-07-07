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
	RecordCount   int64
	Timestamp     int64
	SenderAddress *common.Address
}

type SignedProvideTransaction struct {
	ProvideTransaction *ProvideTransaction
	Signature          string
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
	Age    int64
	Weight float64
	Height float64
}

type ProvideContent struct {
	Records       []Record
	SenderAddress string
}

type BuyContent struct {
	RecordCount  int64
	BuyerAddress string
}
