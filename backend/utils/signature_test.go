package utils

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
)

func Test_SignatureRecovery(t *testing.T) {
	signature := common.Hex2Bytes("0xfe9b4565c32963cc558be2ca1274baab77fd86bd4ad9cf8a9003cd15db431cd87dd1eab9fde96aa2296b5c44f60e36c71e7994cfcb6bd045269f09628a9c97bf1c"[2:])
	recordCount := int64(10)
	senderAddress := common.HexToAddress("0x5040c3fAF34A50De27bf1df3b4a2b3496f91B2ac")

	valid, _ := ValidateSignature(&senderAddress, recordCount, signature)

	assert.True(t, valid)
}
