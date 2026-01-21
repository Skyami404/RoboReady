#!/bin/bash
# Start the VEX Assistant Flask Server
# Run this script from the python_ai directory

echo "=========================================="
echo "VEX Assistant Flask Server Startup"
echo "=========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "../../venv" ]; then
    echo "❌ Virtual environment not found!"
    echo ""
    echo "Please run from project root:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r roboready_app/python_ai/requirements.txt"
    echo ""
    exit 1
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source ../../venv/bin/activate

# Check if required packages are installed
echo "✓ Checking dependencies..."

# Start the Flask server
echo ""
echo "🚀 Starting Flask server..."
echo ""

python flask_server.py
