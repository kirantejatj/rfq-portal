import subprocess
import time
import sys

print("Starting resilient Localtunnel Supervisor...", flush=True)

while True:
    try:
        print(f"[{time.strftime('%X')}] Connecting localtunnel on port 5173 (subdomain: cold-dolls-enjoy)...", flush=True)
        proc = subprocess.Popen(
            ["C:\\Program Files\\nodejs\\npx.cmd", "localtunnel", "--port", "5173", "--subdomain", "cold-dolls-enjoy"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        for line in iter(proc.stdout.readline, ''):
            if line:
                print(f"TUNNEL: {line.strip()}", flush=True)
        proc.wait()
        print(f"[{time.strftime('%X')}] Tunnel closed (exit {proc.returncode}). Reconnecting in 2 seconds...", flush=True)
    except Exception as e:
        print(f"Error in tunnel daemon: {e}", flush=True)
    time.sleep(2)
