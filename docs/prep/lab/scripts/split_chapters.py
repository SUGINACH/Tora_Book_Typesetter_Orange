# מפצל את הטקסט הקנוני לפרקים לפי סמני "כותרת 2 מספר N" (אותה שיטה כמו scripts/test-chapters-enhanced.js של Gold).
import re,sys
src=sys.argv[1]; out=sys.argv[2]
L=open(src,encoding='utf-8',errors='replace').read().split('\n')
idx=[i for i,l in enumerate(L) if re.match(r'^כותרת 2 מספר \d+',l)]
for n,s in enumerate(idx):
    e=idx[n+1] if n+1<len(idx) else len(L)
    open(f'{out}/ch{n+1:02d}.txt','w',encoding='utf-8').write('\n'.join(L[s:e]))
print(len(idx),'chapters')
