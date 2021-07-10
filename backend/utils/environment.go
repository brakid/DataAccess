package utils

import "os"

func Get(environmentVariable string, defaultValue string) string {
	value, ok := os.LookupEnv(environmentVariable)
	if ok {
		return value
	} else {
		return defaultValue
	}
}
