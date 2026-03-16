git init

git add .

git commit -m "SiteV2 Upload from VS to GitHub"

git remote add origin https://github.com/tamamatinfo/TAMAMAT.COM.git

git push -u origin main


To upload VS file to GitHub every time use:

git add .
git commit -m "Type in Changes"
git push

What I need to do to change the Auth to a different repository

1. Clear or replace the cached GitHub credentials so Git will prompt you again:
cmdkey /delete:git:https://github.com
2. git push -u origin main

git push -u origin main --force

Commands to update index.html on github
# 1. see what changed
git status
# 2. stage the file (or everything)
git add index.html
# 3. commit with a message
git commit -m "Update index.html"
# 4. send the commit to GitHub
git push            # because 


UPDATE SPECIFIC FOLDER
git add callmewidget/
git commit -m "Add/upload callmewidget folder"
git push

