#!/bin/bash

# AciTrack Development Helper Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}AciTrack Development Helper${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js version should be 18 or higher${NC}"
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Show menu
echo "What would you like to do?"
echo ""
echo "1) Install all dependencies"
echo "2) Build all projects"
echo "3) Start MCP server (development)"
echo "4) Start UI (development)"
echo "5) Build and start MCP server (production)"
echo "6) Run full setup (install + build)"
echo "7) Clean all build artifacts"
echo "8) Test MCP server tools"
echo "9) Run backend endpoint self-check"
echo "10) Exit"
echo ""
read -p "Enter choice [1-10]: " choice

case $choice in
    1)
        echo -e "${GREEN}Installing dependencies...${NC}"
        echo ""

        echo "Installing MCP server dependencies..."
        cd mcp-server && npm install

        echo ""
        echo "Installing UI dependencies..."
        cd ../ui && npm install

        echo ""
        echo -e "${GREEN}✓ All dependencies installed${NC}"
        ;;

    2)
        echo -e "${GREEN}Building projects...${NC}"
        echo ""

        echo "Building MCP server..."
        cd mcp-server && npm run build

        echo ""
        echo "Building UI..."
        cd ../ui && npm run build

        echo ""
        echo -e "${GREEN}✓ All projects built${NC}"
        ;;

    3)
        echo -e "${GREEN}Starting MCP server in development mode...${NC}"
        echo ""

        # Check if backend URL is set
        if [ -z "$ACITRACK_BACKEND_URL" ]; then
            echo -e "${YELLOW}Warning: ACITRACK_BACKEND_URL not set, using default (http://localhost:8000)${NC}"
            export ACITRACK_BACKEND_URL="http://localhost:8000"
        fi

        echo "Backend URL: $ACITRACK_BACKEND_URL"
        echo ""

        cd mcp-server && npm run dev
        ;;

    4)
        echo -e "${GREEN}Starting UI in development mode...${NC}"
        echo ""
        echo "UI will be available at http://localhost:3000"
        echo ""

        cd ui && npm run dev
        ;;

    5)
        echo -e "${GREEN}Building and starting MCP server...${NC}"
        echo ""

        # Check if backend URL is set
        if [ -z "$ACITRACK_BACKEND_URL" ]; then
            echo -e "${YELLOW}Warning: ACITRACK_BACKEND_URL not set, using default (http://localhost:8000)${NC}"
            export ACITRACK_BACKEND_URL="http://localhost:8000"
        fi

        echo "Backend URL: $ACITRACK_BACKEND_URL"
        echo ""

        cd mcp-server && npm run build && npm start
        ;;

    6)
        echo -e "${GREEN}Running full setup...${NC}"
        echo ""

        echo "Step 1: Installing dependencies..."
        cd mcp-server && npm install
        cd ../ui && npm install

        echo ""
        echo "Step 2: Building projects..."
        cd ../mcp-server && npm run build
        cd ../ui && npm run build

        echo ""
        echo -e "${GREEN}✓ Full setup complete!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Set ACITRACK_BACKEND_URL environment variable"
        echo "2. Run './dev.sh' and choose option 3 or 4 to start development"
        ;;

    7)
        echo -e "${YELLOW}Cleaning build artifacts...${NC}"
        echo ""

        rm -rf mcp-server/dist
        rm -rf ui/dist
        rm -rf mcp-server/node_modules
        rm -rf ui/node_modules

        echo -e "${GREEN}✓ Cleaned${NC}"
        ;;

    8)
        echo -e "${GREEN}Testing MCP server tools...${NC}"
        echo ""

        if [ ! -f "mcp-server/dist/index.js" ]; then
            echo -e "${YELLOW}MCP server not built yet, building now...${NC}"
            cd mcp-server && npm run build && cd ..
        fi

        echo "Starting MCP server..."
        echo ""
        echo "You can now send JSON-RPC requests via stdin"
        echo ""
        echo "Example - List tools:"
        echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
        echo ""
        echo "Example - Get briefing:"
        echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_briefing","arguments":{"since_days":7}}}'
        echo ""

        cd mcp-server && npm start
        ;;

    9)
        echo -e "${GREEN}Running backend endpoint self-check...${NC}"
        echo ""

        cd mcp-server && npm run selfcheck
        ;;

    10)
        echo "Goodbye!"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
