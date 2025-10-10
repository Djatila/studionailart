FROM n8nio/n8n:latest

USER root

# Instalação de pacotes NPM adicionais
RUN npm install -g @supabase/supabase-js

USER node