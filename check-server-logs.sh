#!/bin/bash

# Script to check server logs for trade submission details

echo "🔍 Checking for server logs..."
echo ""

# Check if server is running
if ! pgrep -f "next dev" > /dev/null; then
    echo "❌ Next.js server is not running!"
    echo "   Start it with: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""
echo "📋 To see the full error details, check the terminal where you ran 'npm run dev'"
echo ""
echo "You should see logs like:"
echo "  ========== MAKING DIRECT HTTP CALL =========="
echo "  POLY_ADDRESS (should match API key wallet): 0x..."
echo "  ========== POLYMARKET RESPONSE =========="
echo "  Status: 401 Unauthorized"
echo "  Response Body (full): {...}"
echo ""
echo "💡 The key things to check:"
echo "  1. What POLY_ADDRESS was sent? (should be 0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f)"
echo "  2. What API key was used? (should match the proxy wallet)"
echo "  3. What's the full error response?"
echo ""
echo "If you can't see the logs, try running the test again:"
echo "  node test-trade-verbose.js"
echo ""
echo "Then immediately check your server terminal."


