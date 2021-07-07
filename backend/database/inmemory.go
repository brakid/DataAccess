package database

import (
	"math/rand"
	"time"

	"github.com/brakid/dataaccess/utils"
)

type InMemoryDatabase struct {
	records *[]utils.Record
}

func InstantiateDatabase() *InMemoryDatabase {
	rand.Seed(time.Now().UnixNano())

	records := []utils.Record{}

	inMemoryDatabase := InMemoryDatabase{records: &records}
	return &inMemoryDatabase
}

func (database *InMemoryDatabase) StoreRecords(records *[]utils.Record) {
	*(database.records) = append(*database.records, *records...)
}

func (database *InMemoryDatabase) RetrieveRecords(recordCount int64) (*[]utils.Record, error) {
	records := *database.records

	rand.Shuffle(len(records), func(i, j int) { records[i], records[j] = records[j], records[i] })

	returnRecords := records[0:recordCount]

	return &returnRecords, nil
}
