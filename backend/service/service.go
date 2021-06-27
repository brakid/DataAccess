package service

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/brakid/dataaccess/utils"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
)

type Record struct {
	Age    int64
	Weight float64
	Height float64
}

type ProvideContent struct {
	Records       []Record
	SenderAddress string
}

func HandleProvide(transactionSigner *utils.TransactionSigner) func(context *gin.Context) {
	return func(context *gin.Context) {
		jsonData, err := ioutil.ReadAll(context.Request.Body)

		if err != nil {
			context.String(http.StatusBadGateway, err.Error())
			return
		}
		providedRecords := ProvideContent{}
		err = json.Unmarshal(jsonData, &providedRecords)

		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		fmt.Println(providedRecords)

		recordCount := int64(len(providedRecords.Records))

		if common.IsHexAddress(providedRecords.SenderAddress) == false {
			context.String(http.StatusBadRequest, "Invalid Sender Address")
			return
		}

		senderAddress := common.HexToAddress(providedRecords.SenderAddress)

		provideTransaction, err := utils.CreateProvideTransaction(recordCount, &senderAddress)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		signedProvideTransaction, err := transactionSigner.SignProvideTransaction(provideTransaction)
		if err != nil {
			context.String(http.StatusInternalServerError, err.Error())
			return
		}

		context.JSON(http.StatusOK, signedProvideTransaction)
		return
	}
}
