# installar
npm install -g serverless

# ls inicializar
sls

# sempre fazer deloy antes de tudo para verificar se está com ambiente ok
sls deploy

# invoke aws
sls invoke -f hello

# invoke local
sls invoke local -f hello --log

# dashboard
sls dashboard

# tail observando
sls logs -f hello --tail