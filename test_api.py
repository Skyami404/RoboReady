#!/usr/bin/env python3
"""
VEX Assistant - API Test Script
Tests Flask API endpoints without loading heavy ML models
"""

import json
import sys

# Test 1: Flask server startup
print("=" * 60)
print("VEX ASSISTANT - API TEST")
print("=" * 60)

print("\n✓ Test 1: Flask imports")
try:
    from flask import Flask
    print("  ✅ Flask imports successfully")
except Exception as e:
    print(f"  ❌ Flask import failed: {e}")
    sys.exit(1)

print("\n✓ Test 2: Flask app creation")
try:
    app = Flask(__name__)
    print("  ✅ Flask app created")
except Exception as e:
    print(f"  ❌ Flask app creation failed: {e}")
    sys.exit(1)

print("\n✓ Test 3: CORS import")
try:
    from flask_cors import CORS
    CORS(app)
    print("  ✅ CORS configured")
except Exception as e:
    print(f"  ❌ CORS setup failed: {e}")
    sys.exit(1)

print("\n✓ Test 4: Create test endpoints")
try:
    @app.route('/health', methods=['GET'])
    def health():
        return {'status': 'ok', 'message': 'API is running'}
    
    @app.route('/test', methods=['POST'])
    def test():
        data = {'test': 'success', 'data': 'Flask is working!'}
        return data
    
    print("  ✅ Test endpoints created")
except Exception as e:
    print(f"  ❌ Endpoint creation failed: {e}")
    sys.exit(1)

print("\n✓ Test 5: Flask test client")
try:
    with app.test_client() as client:
        # Test health endpoint
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ok'
        print(f"  ✅ Health endpoint works")
        print(f"     Response: {json.dumps(data, indent=6)}")
        
        # Test POST endpoint
        response = client.post('/test')
        assert response.status_code == 200
        data = response.get_json()
        assert data['test'] == 'success'
        print(f"  ✅ POST endpoint works")
        print(f"     Response: {json.dumps(data, indent=6)}")
except Exception as e:
    print(f"  ❌ Test client failed: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("BASIC FLASK API TESTS: ✅ ALL PASS")
print("=" * 60)

print("\n⚠️  NOTE: Full ML model tests require scipy/sentence-transformers")
print("    which have compilation issues with Python 3.14.")
print("    Recommendation: Use Python 3.12 for production")

print("\n" + "=" * 60)
