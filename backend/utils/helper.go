package utils

import (
	"github.com/ethereum/go-ethereum/accounts"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
)

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
