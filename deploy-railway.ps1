# ============================================================
# SCRIPT DE DEPLOY AUTOMÁTICO PARA RAILWAY
# V.2606181531
# ============================================================

Write-Host ""
Write-Host "🚀 ========================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY RAILWAY - SUMMERMAX WEB" -ForegroundColor Cyan
Write-Host "🚀 ========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Erro: Execute este script na pasta web-app" -ForegroundColor Red
    exit 1
}

# Verificar se Railway CLI está instalado
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✅ Railway CLI instalado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Instalando Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host ""
Write-Host "📋 OPÇÕES DE DEPLOY:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Inicializar projeto Railway (primeira vez)" -ForegroundColor White
Write-Host "2. Fazer deploy (atualizar código)" -ForegroundColor White
Write-Host "3. Ver logs em tempo real" -ForegroundColor White
Write-Host "4. Abrir dashboard do Railway" -ForegroundColor White
Write-Host "5. Configurar variáveis de ambiente" -ForegroundColor White
Write-Host "0. Sair" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Escolha uma opção"

switch ($opcao) {
    "1" {
        Write-Host ""
        Write-Host "🔧 Inicializando projeto Railway..." -ForegroundColor Yellow
        railway login
        railway init
        Write-Host ""
        Write-Host "✅ Projeto inicializado!" -ForegroundColor Green
        Write-Host "⚠️  Configure as variáveis de ambiente no Railway Dashboard" -ForegroundColor Yellow
        Write-Host "    Ver arquivo DEPLOY.md para lista completa" -ForegroundColor Yellow
    }
    "2" {
        Write-Host ""
        Write-Host "📤 Fazendo deploy..." -ForegroundColor Yellow
        railway up
        Write-Host ""
        Write-Host "✅ Deploy concluído!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "📊 Logs em tempo real (Ctrl+C para sair):" -ForegroundColor Yellow
        railway logs
    }
    "4" {
        Write-Host ""
        Write-Host "🌐 Abrindo Railway Dashboard..." -ForegroundColor Yellow
        railway open
    }
    "5" {
        Write-Host ""
        Write-Host "⚙️  Variáveis de Ambiente:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Abra o Railway Dashboard e adicione as seguintes variáveis:" -ForegroundColor White
        Write-Host ""
        Write-Host "PORT=3000"
        Write-Host "NODE_ENV=production"
        Write-Host "DB_HOST=ep-steep-silence-acy3c620.sa-east-1.aws.neon.tech"
        Write-Host "DB_PORT=5432"
        Write-Host "DB_NAME=neondb"
        Write-Host "DB_USER=neondb_owner"
        Write-Host "DB_PASSWORD=npg_GBncO6VelY8C"
        Write-Host "DB_SSL=true"
        Write-Host "JWT_SECRET=summermax_secret_2026_allmax_marina_ctg_graciosa"
        Write-Host "JWT_EXPIRES_IN=24h"
        Write-Host "SESSION_SECRET=summermax_session_secret_2026"
        Write-Host "TZ=America/Sao_Paulo"
        Write-Host ""
        Write-Host "Pressione Enter para abrir o dashboard..."
        Read-Host
        railway open
    }
    "0" {
        Write-Host ""
        Write-Host "👋 Até logo!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Concluído!" -ForegroundColor Green
Write-Host ""

# V.2606181531
