package main

import (
	"encoding/json"
	"os"
)

// PracticeConfig represents the configuration loaded from practice-config.json
type PracticeConfig struct {
	Version    string `json:"version"`
	HomeRowMods struct {
		Left  map[string]string `json:"left"`
		Right map[string]string `json:"right"`
	} `json:"homeRowMods"`
	SymbolLayers map[string]SymbolLayer `json:"symbolLayers"`
	Timing       TimingConfig           `json:"timing"`
	Metadata     struct {
		Generated   string `json:"generated"`
		Source      string `json:"source"`
		Description string `json:"description"`
	} `json:"metadata"`
}

type SymbolLayer struct {
	Activator interface{}       `json:"activator"` // string or []string
	Mode      string            `json:"mode"`
	Mappings  map[string]string `json:"mappings"`
}

type TimingConfig struct {
	ToIfAloneTimeoutMS         int `json:"to_if_alone_timeout_milliseconds"`
	ToIfHeldDownThresholdMS    int `json:"to_if_held_down_threshold_milliseconds"`
	ToDelayedActionDelayMS     int `json:"to_delayed_action_delay_milliseconds"`
	SimultaneousThresholdMS    int `json:"simultaneous_threshold_milliseconds"`
}

// LoadConfig loads the practice configuration from a JSON file
func LoadConfig(path string) (*PracticeConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var config PracticeConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

// IsHRMKey checks if a key is a home row mod
func (c *PracticeConfig) IsHRMKey(key rune) bool {
	keyStr := string(key)
	if _, ok := c.HomeRowMods.Left[keyStr]; ok {
		return true
	}
	if _, ok := c.HomeRowMods.Right[keyStr]; ok {
		return true
	}
	return false
}

// GetModifier returns the modifier name for an HRM key
func (c *PracticeConfig) GetModifier(key rune) string {
	keyStr := string(key)
	if mod, ok := c.HomeRowMods.Left[keyStr]; ok {
		return mod
	}
	if mod, ok := c.HomeRowMods.Right[keyStr]; ok {
		return mod
	}
	return ""
}

// GetAllHRMKeys returns all HRM keys as a slice
func (c *PracticeConfig) GetAllHRMKeys() []string {
	keys := make([]string, 0)
	for k := range c.HomeRowMods.Left {
		keys = append(keys, k)
	}
	for k := range c.HomeRowMods.Right {
		keys = append(keys, k)
	}
	return keys
}
