const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('@/components/ui')) {
                const original = content;
                content = content.replace(/@\/components\/ui\//g, '@/components/UI/');
                content = content.replace(/from '@\/components\/ui'/g, "from '@/components/UI'");
                content = content.replace(/from "@\/components\/ui"/g, 'from "@/components/UI"');

                if (original !== content) {
                    fs.writeFileSync(fullPath, content);
                    console.log('Fixed ' + fullPath);
                }
            }
        }
    });
}
processDir('./src');
console.log('Done scanning src');
