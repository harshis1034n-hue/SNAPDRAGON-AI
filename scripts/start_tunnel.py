import os
import sys
import subprocess
import time

PORT = int(os.getenv("PORT", "8000"))

print("=" * 65)
print("         CAMPUS ORBIT - PUBLIC HTTPS TUNNEL (PYTHON)")
print("=" * 65)
print(f"\n[*] Establishing secure public tunnel forwarding to http://127.0.0.1:{PORT}...")
print("[*] Connecting to edge tunnel network...\n")

# Try 1: Try npx localtunnel with full PATH
try:
    node_dir = r"C:\Program Files\nodejs"
    env = os.environ.copy()
    if os.path.exists(node_dir):
        env["PATH"] = f"{node_dir};" + env.get("PATH", "")
    
    npx_cmd = os.path.join(node_dir, "npx.cmd") if os.path.exists(os.path.join(node_dir, "npx.cmd")) else "npx"
    
    proc = subprocess.Popen([npx_cmd, "-y", "localtunnel", "--port", str(PORT)],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
    
    for line in proc.stdout:
        print(line, end="")
        if "url is:" in line:
            url = line.split("url is:")[1].strip()
            print("\n" + "=" * 65)
            print(f"🎉 LIVE PUBLIC URL GENERATED: {url}")
            print("=" * 65 + "\n")
            
    proc.wait()
except Exception as e:
    print(f"[!] Localtunnel exception: {e}")
    print(f"[*] Alternative: You can expose localhost:{PORT} using Cloudflare / Ngrok / Pinggy.")
