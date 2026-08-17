import re

def replace_slate(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replacer(match):
        before = match.group(1).strip()
        after = match.group(2).strip()
        new_classes = ' '.join(filter(None, [before, after]))
        if new_classes:
            return f'className="{new_classes}" style={{{{ color: "var(--text-muted)" }}}}'
        else:
            return f'style={{{{ color: "var(--text-muted)" }}}}'
            
    # Replace className="... text-slate-[345]00 ..."
    new_content = re.sub(r'className="([^"]*)text-slate-[345]00([^"]*)"', replacer, content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

replace_slate('app/components/marketing/MarketingFeatures.tsx')
replace_slate('app/components/marketing/MarketingSocialProof.tsx')
