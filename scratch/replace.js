const fs = require('fs');

function replaceSlate(filename) {
    let content = fs.readFileSync(filename, 'utf-8');
    
    // Replace className="... text-slate-[345]00 ..."
    content = content.replace(/className="([^"]*)text-slate-[345]00([^"]*)"/g, (match, before, after) => {
        let newClasses = [before.trim(), after.trim()].filter(Boolean).join(' ');
        if (newClasses) {
            return `className="${newClasses}" style={{ color: "var(--text-muted)" }}`;
        } else {
            return `style={{ color: "var(--text-muted)" }}`;
        }
    });
    
    fs.writeFileSync(filename, content, 'utf-8');
}

replaceSlate('app/components/marketing/MarketingFeatures.tsx');
replaceSlate('app/components/marketing/MarketingSocialProof.tsx');
