package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Payload struct {
	ShortcutCount int  `json:"shortcutCount"`
	AutoPin       bool `json:"autoPin"`
}

type Result struct {
	Plugin      string   `json:"plugin"`
	Status      string   `json:"status"`
	Actions     []string `json:"actions"`
	Pinned      bool     `json:"pinned"`
	Message     string   `json:"message"`
}

func main() {
	body, _ := io.ReadAll(os.Stdin)
	payload := Payload{ShortcutCount: 4, AutoPin: true}
	if len(body) > 0 {
		_ = json.Unmarshal(body, &payload)
	}

	actions := make([]string, 0, payload.ShortcutCount)
	for i := 0; i < payload.ShortcutCount; i++ {
		actions = append(actions, fmt.Sprintf("Action %d", i+1))
	}

	result := Result{
		Plugin:  "go-quick-actions",
		Status:  "ok",
		Actions: actions,
		Pinned:  payload.AutoPin,
		Message: "Go plugin generated quick action suggestions.",
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetEscapeHTML(false)
	_ = encoder.Encode(result)
}
