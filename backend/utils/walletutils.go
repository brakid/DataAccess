package utils

import (
	"encoding/hex"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	solsha3 "github.com/miguelmota/go-solidity-sha3"
)

func InstantiateTransactionSigner() (*TransactionSigner, error) {
	mnemonic := "impose believe guitar thrive clean tourist attitude edge swim stuff salon tiny"
	wallet, err := hdwallet.NewFromMnemonic(mnemonic)
	if err != nil {
		return nil, err
	}

	path := hdwallet.MustParseDerivationPath("m/44'/60'/0'/0/0")
	account, err := wallet.Derive(path, false)
	if err != nil {
		return nil, err
	}

	fmt.Printf("Signer account: %v\n", account.Address.Hex())

	return &TransactionSigner{wallet, &account}, nil
}

func (transactionSigner *TransactionSigner) signHash(hash []byte) ([]byte, error) {
	privateKey, err := transactionSigner.Wallet.PrivateKey(*transactionSigner.SignerAccount)
	if err != nil {
		return nil, err
	}

	signature, err := crypto.Sign(hash, privateKey)
	if err != nil {
		return nil, err
	}

	return signature, nil
}

func (transactionSigner *TransactionSigner) SignProvideTransaction(provideTransaction *ProvideTransaction) (*SignedProvideTransaction, error) {
	recordHash := solsha3.SoliditySHA3(
		solsha3.Uint256(big.NewInt(provideTransaction.RecordCount)),
		solsha3.Uint256(big.NewInt(provideTransaction.Timestamp)),
		solsha3.Address(provideTransaction.SenderAddress.Hex()),
	)

	signatureHash := solsha3.SoliditySHA3(
		solsha3.String("\x19Ethereum Signed Message:\n32"),
		solsha3.Bytes32(recordHash),
	)

	signature, err := transactionSigner.signHash(signatureHash)
	if err != nil {
		return nil, err
	}

	return &SignedProvideTransaction{provideTransaction, "0x" + hex.EncodeToString(signature)}, nil
}

// different hash calculation needed due to ethers logic to convert hex strings into bytes instead of recognizing them as hex.
func ValidateSignature(buyerAddress *common.Address, recordCount int64, signature []byte) (bool, error) {
	signature[64] = signature[64] - byte(27)
	recordHash := solsha3.SoliditySHA3(
		solsha3.Address(buyerAddress.Hex()),
		solsha3.Uint256(big.NewInt(recordCount)),
	)
	recordHashString := "0x" + common.Bytes2Hex(recordHash)
	prefixString := fmt.Sprintf("\x19Ethereum Signed Message:\n%v", len(recordHashString))
	signatureHash := crypto.Keccak256Hash(append([]byte(prefixString), []byte(recordHashString)...))

	publicKey, err := crypto.SigToPub(signatureHash.Bytes(), signature)
	if err != nil {
		return false, err
	}

	return crypto.PubkeyToAddress(*publicKey) == *buyerAddress, nil
}
