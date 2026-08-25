#!/bin/sh
set -e

echo "Starting PocketBase..."
./pocketbase serve --http="0.0.0.0:9597"
