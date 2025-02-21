package utils

import (
	"fmt"
	"net"
	"os"
	"runtime"
	"time"
)

const (
	colorReset  = "\033[0m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
)

func GetLocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "unknown"
	}
	for _, addr := range addrs {
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return "unknown"
}

func PrintServerInfo(port string) {
	// Get container hostname
	hostname, _ := os.Hostname()
	
	fmt.Printf("\n   ⬡ Go Server %s\n", runtime.Version())
	fmt.Printf("   - Local:        http://localhost%s\n", port)
	fmt.Printf("   - Network:      http://%s%s\n", hostname, port)
	fmt.Printf("\n")
	
	startTime := time.Now()
	fmt.Printf(" %s✓%s Starting...\n", colorGreen, colorReset)
	
	// Small delay to match Next.js style
	time.Sleep(100 * time.Millisecond)
	
	fmt.Printf(" %s✓%s Ready in %dms\n", colorGreen, colorReset, time.Since(startTime).Milliseconds())
	fmt.Printf("\n Available Routes:\n")
	fmt.Printf(" %s-%s /query (POST)\n", colorYellow, colorReset)
} 