// ============================================================
// VERIFICAÇÃO PRÉ-DEPLOY
// V.2610292223
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VERIFICANDO PROJETO ANTES DO DEPLOY...\n');

let erros = 0;
let avisos = 0;

// ========================================
// 1. VERIFICAR ARQUIVOS ESSENCIAIS
// ========================================
console.log('📂 Verificando arquivos essenciais...');

const arquivosEssenciais = [
    'package.json',
    'server.js',
    'railway.json',
    '.gitignore',
    '.env.example'
];

arquivosEssenciais.forEach(arquivo => {
    if (fs.existsSync(path.join(__dirname, arquivo))) {
        console.log(`   ✅ ${arquivo}`);
    } else {
        console.log(`   ❌ ${arquivo} NÃO ENCONTRADO`);
        erros++;
    }
});

// ========================================
// 2. VERIFICAR PACKAGE.JSON
// ========================================
console.log('\n📦 Verificando package.json...');

try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

    if (packageJson.type === 'module') {
        console.log('   ✅ Type: module');
    } else {
        console.log('   ⚠️  Type não é "module"');
        avisos++;
    }

    if (packageJson.scripts && packageJson.scripts.start) {
        console.log(`   ✅ Start script: ${packageJson.scripts.start}`);
    } else {
        console.log('   ❌ Script "start" não encontrado');
        erros++;
    }

    const dependenciasEssenciais = ['express', 'pg', 'dotenv', 'jsonwebtoken', 'bcrypt'];
    console.log('\n   Dependências essenciais:');
    dependenciasEssenciais.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`      ✅ ${dep}`);
        } else {
            console.log(`      ❌ ${dep} não encontrado`);
            erros++;
        }
    });

} catch (error) {
    console.log('   ❌ Erro ao ler package.json');
    erros++;
}

// ========================================
// 3. VERIFICAR .GITIGNORE
// ========================================
console.log('\n🚫 Verificando .gitignore...');

try {
    const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');

    if (gitignore.includes('.env')) {
        console.log('   ✅ .env está no .gitignore');
    } else {
        console.log('   ❌ .env NÃO está no .gitignore (CRÍTICO!)');
        erros++;
    }

    if (gitignore.includes('node_modules')) {
        console.log('   ✅ node_modules está no .gitignore');
    } else {
        console.log('   ⚠️  node_modules não está no .gitignore');
        avisos++;
    }

} catch (error) {
    console.log('   ❌ Erro ao ler .gitignore');
    erros++;
}

// ========================================
// 4. VERIFICAR SERVER.JS
// ========================================
console.log('\n🖥️  Verificando server.js...');

try {
    const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

    if (serverJs.includes('process.env.PORT')) {
        console.log('   ✅ Usa process.env.PORT');
    } else {
        console.log('   ❌ NÃO usa process.env.PORT');
        erros++;
    }

    if (serverJs.includes('dotenv')) {
        console.log('   ✅ Importa dotenv');
    } else {
        console.log('   ⚠️  Não importa dotenv');
        avisos++;
    }

} catch (error) {
    console.log('   ❌ Erro ao ler server.js');
    erros++;
}

// ========================================
// 5. VERIFICAR SE .ENV EXISTE (LOCAL)
// ========================================
console.log('\n🔐 Verificando .env local...');

if (fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('   ✅ .env existe (NÃO SERÁ ENVIADO AO GIT)');
} else {
    console.log('   ⚠️  .env não encontrado (normal se já está configurado)');
}

// ========================================
// RESUMO FINAL
// ========================================
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMO DA VERIFICAÇÃO');
console.log('='.repeat(50));

if (erros === 0 && avisos === 0) {
    console.log('✅ TUDO OK! Projeto pronto para deploy no Railway!');
    process.exit(0);
} else {
    if (erros > 0) {
        console.log(`❌ ${erros} erro(s) encontrado(s)`);
    }
    if (avisos > 0) {
        console.log(`⚠️  ${avisos} aviso(s) encontrado(s)`);
    }

    if (erros > 0) {
        console.log('\n❌ CORRIJA OS ERROS ANTES DE FAZER DEPLOY!');
        process.exit(1);
    } else {
        console.log('\n⚠️  Projeto pode ser deployado, mas há avisos.');
        process.exit(0);
    }
}

// V.2610292223
