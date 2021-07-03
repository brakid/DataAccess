package utils

import (
	"errors"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts"
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
	Signature          []byte
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