package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

func main() {
	// Try to load config from default location
	configPath := "../practice-output/practice-config.json"

	// Check if config exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// Try alternative path
		configPath = "./practice-config.json"
		if _, err := os.Stat(configPath); os.IsNotExist(err) {
			fmt.Println("❌ practice-config.json not found!")
			fmt.Println("   Run 'npm run export' from the parent directory first.")
			fmt.Printf("   Looking for: %s\n", configPath)
			os.Exit(1)
		}
	}

	absPath, _ := filepath.Abs(configPath)
	fmt.Printf("Loading config from: %s\n", absPath)

	config, err := LoadConfig(configPath)
	if err != nil {
		fmt.Printf("❌ Error loading config: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Config loaded (v%s)\n", config.Version)

	// Try to load wordlists
	wordlistsPath := "../practice-output/monkeytype-wordlists"
	if _, err := os.Stat(wordlistsPath); os.IsNotExist(err) {
		wordlistsPath = "./monkeytype-wordlists"
	}

	wordlists, err := LoadAllWordlists(wordlistsPath)
	if err != nil || len(wordlists) == 0 {
		fmt.Println("⚠️  No wordlists found (this is optional)")
		wordlists = make(map[string]*MonkeyTypeWordlist)
	} else {
		fmt.Printf("✓ Loaded %d wordlists\n", len(wordlists))
	}

	fmt.Println("Starting trainer...")
	time.Sleep(1 * time.Second)

	// Create and run the Bubbletea app
	p := tea.NewProgram(
		NewModel(config, wordlists),
		tea.WithAltScreen(),
	)

	if _, err := p.Run(); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
