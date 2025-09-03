#!/usr/bin/env python3
"""Command-line interface for GA Analytics Agent."""

import asyncio
import sys
from typing import Optional
from src.agent import run_analytics_query, run_proactive_monitoring, get_dashboard_summary
from src.settings import settings
import json


async def main():
    """Main CLI entry point."""
    print("🎯 GA Analytics Dashboard Agent")
    print("=" * 50)
    
    # Check if running in interactive mode or with arguments
    if len(sys.argv) > 1:
        # Command mode
        command = sys.argv[1].lower()
        
        if command == "query" and len(sys.argv) > 2:
            # Run a query
            query = " ".join(sys.argv[2:])
            print(f"\n📊 Running query: {query}")
            result = await run_analytics_query(query)
            print(f"\n{result}")
            
        elif command == "monitor":
            # Run proactive monitoring
            print("\n🔍 Running proactive monitoring...")
            result = await run_proactive_monitoring()
            print(f"\n{result}")
            
        elif command == "dashboard":
            # Get dashboard summary
            print("\n📈 Fetching dashboard data...")
            result = await get_dashboard_summary()
            print(json.dumps(result, indent=2))
            
        else:
            print("\nUsage:")
            print("  python cli.py query <your analytics question>")
            print("  python cli.py monitor")
            print("  python cli.py dashboard")
            print("  python cli.py  # Interactive mode")
    
    else:
        # Interactive mode
        print("\nInteractive mode. Type 'help' for commands or 'quit' to exit.")
        print("\nAvailable commands:")
        print("  help     - Show this help message")
        print("  monitor  - Run proactive monitoring")
        print("  dashboard - Get dashboard summary")
        print("  quit     - Exit the program")
        print("\nOr type any analytics question to get insights.\n")
        
        while True:
            try:
                query = input("📊 GA Agent > ").strip()
                
                if not query:
                    continue
                    
                if query.lower() == "quit":
                    print("Goodbye! 👋")
                    break
                    
                elif query.lower() == "help":
                    print("\nAvailable commands:")
                    print("  help     - Show this help message")
                    print("  monitor  - Run proactive monitoring")
                    print("  dashboard - Get dashboard summary")
                    print("  quit     - Exit the program")
                    print("\nOr type any analytics question to get insights.\n")
                    
                elif query.lower() == "monitor":
                    print("\n🔍 Running proactive monitoring...")
                    result = await run_proactive_monitoring()
                    print(f"\n{result}\n")
                    
                elif query.lower() == "dashboard":
                    print("\n📈 Fetching dashboard data...")
                    result = await get_dashboard_summary()
                    print(json.dumps(result, indent=2))
                    print()
                    
                else:
                    # Run as analytics query
                    print("\n⏳ Analyzing...")
                    result = await run_analytics_query(query)
                    print(f"\n{result}\n")
                    
            except KeyboardInterrupt:
                print("\n\nGoodbye! 👋")
                break
            except Exception as e:
                print(f"\n❌ Error: {str(e)}\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nGoodbye! 👋")
        sys.exit(0)