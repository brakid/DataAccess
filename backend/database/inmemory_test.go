package database

import (
	"testing"

	"github.com/brakid/dataaccess/utils"
	"github.com/stretchr/testify/assert"
)

func Test_StoreRecords(t *testing.T) {
	database := InstantiateDatabase()

	records := []utils.Record{{Age: 1, Height: 1, Weight: 1}, {Age: 2, Height: 2, Weight: 2}}

	database.StoreRecords(&records)

	assert.EqualValues(t, *database.records, records)
}

func Test_StoreRecordsWithPrevious(t *testing.T) {
	database := InstantiateDatabase()

	(*database.records) = append((*database.records), utils.Record{Age: 1, Height: 1, Weight: 1})

	records := []utils.Record{{Age: 2, Height: 2, Weight: 2}}

	database.StoreRecords(&records)

	assert.EqualValues(t, *database.records, []utils.Record{{Age: 1, Height: 1, Weight: 1}, {Age: 2, Height: 2, Weight: 2}})
}

func Test_RetrieveRecords(t *testing.T) {
	database := InstantiateDatabase()
	records := []utils.Record{{Age: 1, Height: 1, Weight: 1}, {Age: 2, Height: 2, Weight: 2}, {Age: 3, Height: 3, Weight: 3}}
	database.StoreRecords(&records)

	retrievedRecords, _ := database.RetrieveRecords(2)

	assert.Equal(t, len(*retrievedRecords), 2)
}

func Test_RetrieveZeroRecords(t *testing.T) {
	database := InstantiateDatabase()
	records := []utils.Record{{Age: 1, Height: 1, Weight: 1}, {Age: 2, Height: 2, Weight: 2}, {Age: 3, Height: 3, Weight: 3}}
	database.StoreRecords(&records)

	retrievedRecords, _ := database.RetrieveRecords(0)

	assert.Equal(t, len(*retrievedRecords), 0)
}

func Test_RetrieveMoreRecordsThanExist(t *testing.T) {
	database := InstantiateDatabase()
	records := []utils.Record{{Age: 1, Height: 1, Weight: 1}, {Age: 2, Height: 2, Weight: 2}, {Age: 3, Height: 3, Weight: 3}}
	database.StoreRecords(&records)

	retrievedRecords, _ := database.RetrieveRecords(10)

	assert.Equal(t, len(*retrievedRecords), 3)
	assert.EqualValues(t, *database.records, records)
}
