package utils

import (
	"encoding/json"
	"io/ioutil"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
)

func GetContractAbi(fileName string) (*abi.ABI, error) {
	data, err := ioutil.ReadFile(fileName)
	if err != nil {
		return nil, err
	}

	tokenJson := make(map[string]interface{})

	err = json.Unmarshal(data, &tokenJson)
	if err != nil {
		return nil, err
	}

	abiJson, err := json.Marshal(tokenJson["abi"])
	if err != nil {
		return nil, err
	}

	contractAbi, err := abi.JSON(strings.NewReader(string(abiJson)))
	if err != nil {
		return nil, err
	}

	return &contractAbi, nil
}
