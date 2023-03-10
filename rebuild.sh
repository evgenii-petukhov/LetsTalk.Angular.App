git reset --hard
git checkout origin/master
git pull origin master
npm install --quiet
npm run build:dev:hosting