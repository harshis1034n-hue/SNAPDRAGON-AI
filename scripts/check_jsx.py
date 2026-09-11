import os
import re

frontend_src = "frontend/src"
undefined_found = False

for root, dirs, files in os.walk(frontend_src):
    for f in files:
        if f.endswith(".tsx"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as fp:
                content = fp.read()
            tags = set(re.findall(r"<([A-Z][a-zA-Z0-9]+)", content))
            import_matches = re.findall(r"import\s+\{([^}]+)\}\s+from", content)
            imported_names = set()
            for group in import_matches:
                names = [n.strip().split(" as ")[-1].strip() for n in group.split(",")]
                imported_names.update(names)
            
            # Default imports e.g. import React from 'react'
            default_imports = re.findall(r"import\s+([A-Z][a-zA-Z0-9]+)\s+from", content)
            imported_names.update(default_imports)

            # Local component definitions
            comp_defs = set(re.findall(r"(?:const|function|class|interface|type)\s+([A-Z][a-zA-Z0-9]+)", content))
            
            # Built-in or standard HTML / SVG JSX elements starting with capital: none standard HTML is lowercase
            for tag in tags:
                if tag not in imported_names and tag not in comp_defs:
                    print(f"UNDEFINED in {f}: {tag}")
                    undefined_found = True

if not undefined_found:
    print("All JSX tags are properly imported!")
