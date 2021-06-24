package utils

import (
	"errors"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	solsha3 "github.com/miguelmota/go-solidity-sha3"
)

type ProvideTransaction struct {
	RecordCount   uint
	Timestamp     uint
	SenderAddress *common.Address
}

type SignedProvideTransaction struct {
	ProvideTransaction *ProvideTransaction
	Signature          []byte
}

func InstantiateWallet() (*hdwallet.Wallet, *accounts.Account, error) {
	mnemonic := "impose believe guitar thrive clean tourist attitude edge swim stuff salon tiny"
	wallet, err := hdwallet.NewFromMnemonic(mnemonic)
	if err != nil {
		return nil, nil, err
	}

	path := hdwallet.MustParseDerivationPath("m/44'/60'/0'/0/0")
	account, err := wallet.Derive(path, false)
	if err != nil {
		return nil, nil, err
	}

	return wallet, &account, nil
}

func CreateProvideTransaction(recordCount uint, senderAddress *common.Address) (*ProvideTransaction, error) {
	if recordCount == 0 {
		return nil, errors.New("Invalid record count")
	}

	if senderAddress == nil {
		return nil, errors.New("Invalid sender address")
	}

	var timestamp uint = 123
	return &ProvideTransaction{recordCount, timestamp, senderAddress}, nil
}

func SignHash(hash []byte, wallet *hdwallet.Wallet, signerAccount *accounts.Account) ([]byte, error) {
	privateKey, err := wallet.PrivateKey(*signerAccount)
	if err != nil {
		return nil, err
	}

	signature, err := crypto.Sign(hash, privateKey)
	if err != nil {
		return nil, err
	}

	return signature, nil
}

func SignProvideTransaction(provideTransaction *ProvideTransaction, wallet *hdwallet.Wallet, signerAccount *accounts.Account) (*SignedProvideTransaction, error) {
	recordHash := solsha3.SoliditySHA3(
		solsha3.Uint256(big.NewInt(int64(provideTransaction.RecordCount))),
		solsha3.Uint256(big.NewInt(int64(provideTransaction.Timestamp))),
		solsha3.Address(provideTransaction.SenderAddress.Hex()),
	)

	fmt.Println(hexutil.Encode(recordHash))

	signature, err := SignHash(recordHash, wallet, signerAccount)
	if err != nil {
		return nil, err
	}

	return &SignedProvideTransaction{provideTransaction, signature}, nil
}
