branch="master"
while getopts b: args
do
    case "${args}" in
        b) branch=${OPTARG};;
    esac
done

git reset --hard
git fetch origin
git checkout origin/${branch}
git pull origin ${branch}
npm install --quiet
npm run build:dev:hosting