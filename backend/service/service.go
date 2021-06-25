package service

import (
	"net/http"
	"strconv"

	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
)

func HandleProvide(transactionSigner *utils.TransactionSigner) func(context *gin.Context) {
	return func(context *gin.Context) {
		recordCountString := context.Query("recordCount")
		senderAddressString := context.Query("senderAddress")

		recordCount, err := strconv.ParseInt(recordCountString, 10, 64)
		if err != nil {
			context.String(http.StatusBadRequest, "Invalid record count")
			return
		}

		if common.IsHexAddress(senderAddressString) == false {
			context.String(http.StatusBadRequest, "Invalid Sender Address")
			return
		}

		senderAddress := common.HexToAddress(senderAddressString)

		provideTransaction, err := utils.CreateProvideTransaction(recordCount, &senderAddress)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		signedProvideTransaction, err := utils.SignProvideTransaction(provideTransaction, transactionSigner)
		if err != nil {
			context.String(http.StatusInternalServerError, err.Error())
			return
		}

		context.JSON(http.StatusOK, signedProvideTransaction)
		return
	}
}
