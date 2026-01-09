#!/bin/bash
cd "$(dirname "$0")"
git add .
git commit -m "Atualizado CSP para permitir webhook do easypanel"
git push
