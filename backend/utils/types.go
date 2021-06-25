package utils

import (
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
)

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
