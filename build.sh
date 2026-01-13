#!/bin/bash
# Build script for unified deployment

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Build complete!"
