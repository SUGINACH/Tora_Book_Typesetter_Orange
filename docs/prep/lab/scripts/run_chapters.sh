#!/bin/bash
# usage: chap.sh engine(green|gold) chapters...  ; resumable; stops after ~250s
export LAB_GOOGLE_FONTS=1 NODE_PATH=/home/claude/lab140/node_modules
eng=$1; shift
dir=/home/claude/green; [ $eng = gold ] && { dir=/home/claude/lab/goldtree; cp /home/claude/green/geometry-audit.js $dir/geometry-audit.js; cp /home/claude/green/tools/geometry-audit-cli.js $dir/tools/; }
start=$(date +%s)
for n in "$@"; do
  nn=$(printf %02d $n); out=/home/claude/lab/out/chap/${eng}_ch$nn
  [ -f $out.json ] && continue
  [ $(( $(date +%s)-start )) -gt 230 ] && { echo "time budget reached before ch$nn"; break; }
  cd $dir; timeout 150 node tools/geometry-audit-cli.js --input /home/claude/lab/chapters/ch$nn.txt --fail-on none --step-audit-disabled --timeout-ms 140000 --report $out.json --summary $out.md > $out.log 2>&1
  echo "$eng ch$nn exit=$?"
done
