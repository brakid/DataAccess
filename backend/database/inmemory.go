package database

import (
	"errors"
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

func (database *InMemoryDatabase) StoreRecords(records *[]utils.Record) bool {
	*(database.records) = append(*database.records, *records...)
	return true
}

func (database *InMemoryDatabase) RetrieveRecords(recordCount int64) (*[]utils.Record, error) {
	if recordCount < 0 {
		return nil, errors.New("Invalid record count")
	}
	records := make([]utils.Record, len(*database.records))
	copy(records, *database.records)

	rand.Shuffle(len(records), func(i, j int) { records[i], records[j] = records[j], records[i] })

	recordCountToReturn := recordCount
	if recordCount > int64(len(records)) {
		recordCountToReturn = int64(len(records))
	}

	returnRecords := records[0:recordCountToReturn]

	return &returnRecords, nil
}

func (database *InMemoryDatabase) RecordCount() int64 {
	return int64(len(*database.records))
}
